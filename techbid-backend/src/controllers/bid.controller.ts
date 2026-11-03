import { Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { placeBidSchema } from "../validations/bid.schema";

export async function placeBid(req: AuthRequest, res: Response) {
  try {
    const bidderId = req.user?.userId;
    if (!bidderId) {
      return res.status(401).json({ error: "Yêu cầu đăng nhập để đặt giá" });
    }

    // 1. Lấy auctionId từ URL params (/api/auctions/:id/bid)
    const { id: auctionId } = req.params;

    // 2. Validate dữ liệu body bằng Zod
    const validatedData = placeBidSchema.parse(req.body);
    const bidAmount = BigInt(validatedData.amount);

    // 3. Thực thi Transaction với Pessimistic Locking
    const result = await prisma.$transaction(async (tx) => {
      // 3.1. KHÓA DÒNG AUCTION: SELECT ... FOR UPDATE
      const auctions: any[] = await tx.$queryRaw`
                SELECT * FROM "Auction" WHERE id = ${auctionId} FOR UPDATE
            `;

      if (!auctions || auctions.length === 0) {
        throw new Error("AUCTION_NOT_FOUND");
      }

      const auction = auctions;

      // 3.2. Lấy thông tin người đặt giá để kiểm tra số dư ví
      const bidder = await tx.user.findUnique({
        where: { id: bidderId },
      });

      if (!bidder) {
        throw new Error("USER_NOT_FOUND");
      }

      // 3.3. Kiểm tra 6 quy tắc nghiệp vụ
      const now = new Date();

      // Quy tắc 1: Trạng thái phải là ACTIVE
      if (auction.status !== "ACTIVE") {
        throw new Error("AUCTION_NOT_ACTIVE");
      }

      // Quy tắc 2: Chưa hết giờ
      if (now > new Date(auction.endTime)) {
        throw new Error("AUCTION_ENDED");
      }

      // Quy tắc 3: Giá đặt mới >= Giá hiện tại + Bước giá
      const minBidRequired =
        BigInt(auction.currentPrice) + BigInt(auction.stepPrice);
      if (bidAmount < minBidRequired) {
        throw new Error(`BID_TOO_LOW:${minBidRequired.toString()}`);
      }

      // Quy tắc 4: Người bán không được tự đấu giá
      if (bidderId === auction.sellerId) {
        throw new Error("SELLER_CANNOT_BID");
      }

      // Quy tắc 5: Đang dẫn đầu thì không được tự đặt đè lên chính mình
      if (bidderId === auction.currentWinnerId) {
        throw new Error("ALREADY_HIGHEST_BIDDER");
      }

      // Quy tắc 6: Số dư ví phải >= số tiền đặt
      if (BigInt(bidder.balance) < bidAmount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // 3.4. CẬP NHẬT DỮ LIỆU KHI TẤT CẢ ĐIỀU KIỆN ĐỀU HỢP LỆ
      // Cập nhật giá hiện tại và người dẫn đầu của phiên đấu giá
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: bidAmount,
          currentWinnerId: bidderId,
        },
      });

      // Tạo lịch sử lượt đặt giá vào bảng Bid
      const newBid = await tx.bid.create({
        data: {
          auctionId: auctionId,
          bidderId: bidderId,
          amount: bidAmount,
        },
      });

      return { updatedAuction, newBid };
    });

    // 4. Trả kết quả thành công về cho Client
    return res.status(201).json({
      message: "Đặt giá thành công",
      data: {
        auctionId: result.updatedAuction.id,
        newPrice: result.updatedAuction.currentPrice.toString(),
        bidId: result.newBid.id,
      },
    });
  } catch (error: any) {
    console.error("X Lỗi tại placeBid:", error.message || error);

    // Xử lý lỗi Validate từ Zod
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Dữ liệu gửi lên không hợp lệ",
        details: error.issues.map((e) => e.message),
      });
    }

    // Xử lý các lỗi nghiệp vụ trong Transaction
    const errMessage = error.message || "";
    if (errMessage === "AUCTION_NOT_FOUND") {
      return res.status(404).json({ error: "Không tìm thấy phiên đấu giá" });
    }
    if (errMessage === "AUCTION_NOT_ACTIVE") {
      return res
        .status(400)
        .json({ error: "Phiên đấu giá chưa mở hoặc đã kết thúc" });
    }
    if (errMessage === "AUCTION_ENDED") {
      return res.status(400).json({ error: "Phiên đấu giá đã hết thời gian" });
    }
    if (errMessage.startsWith("BID_TOO_LOW")) {
      const minRequired = errMessage.split(":")[5];
      return res.status(400).json({
        error: `Giá đặt quá thấp. Mức giá tối thiểu hợp lệ là ${minRequired} VNĐ`,
      });
    }
    if (errorMessage === "SELLER_CANNOT_BID") {
      return res
        .status(400)
        .json({ error: "Người bán không được tự đặt giá sản phẩm của mình" });
    }
    if (errMessage === "ALREADY_HIGHEST_BIDDER") {
      return res
        .status(400)
        .json({ error: "Bạn đang là người trả giá cao nhất" });
    }
    if (errMessage === "INSUFFICIENT_BALANCE") {
      return res
        .status(400)
        .json({ error: "Số dư ví ảo không đủ để đặt mức giá này" });
    }

    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
}
