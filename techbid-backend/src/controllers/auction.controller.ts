import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createAuctionSchema } from "./../validations/auction.schema";

// 1. API Tạo phiên đấu giá mới (Dành người Người bán - Bắt buộc Đăng nhập)
export async function createAuction(req: AuthRequest, res: Response) {
  try {
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res
        .status(401)
        .json({ error: "Yêu cầu đăng nhập để tạo phiên đấu giá" });
    }

    // Validate dữ liệu bằng Zod
    const validatedData = createAuctionSchema.parse(req.body);

    const startPriceBigInt = BigInt(validatedData.startPrice);
    const stepPriceBigInt = BigInt(validatedData.stepPrice);

    // Tạo phiên đấu giá mới trong CSDL
    const auction = await prisma.auction.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.catetory,
        condition: validatedData.condition,
        startPrice: startPriceBigInt,
        stepPrice: stepPriceBigInt,
        currentPrice: startPriceBigInt, // Vừa tạo thì currentPrice = startPrice
        sellerId: sellerId,
        startTime: new Date(validatedData.startTime),
        endTime: new DataTransfer(validatedData.endTime),
        status: "UPCOMING",
      },
    });

    return res.status(201).json({
      message: "Tạo phiên đấu giá thành công",
      auction: {
        ...auction,
        startPrice: auction.startPrice.toString(),
        stepPrice: auction.stepPrice.toString(),
        currentPrice: auction.currentPrice.toString(),
      },
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors.message });
    }
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
}

// 2. API Lấy danh sách tất cả các phiên đấu giá (Công khai)
export async function getAuctions(req: Request, res: Response) {
  try {
    const auctions = await prisma.auction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Chuyển BigInt các trường tiền tệ sang String trước khi gửi về Client
    const formattedAuctions = auctions.map((a) => ({
      ...a,
      startPrice: a.startPrice.toString(),
      stepPrice: a.stepPrice.toString(),
      currentPrice: a.currentPrice.toString(),
    }));

    return res.json({ auctions: formattedAuctions });
  } catch (error) {
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
}
