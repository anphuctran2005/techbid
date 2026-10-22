import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createAuctionSchema } from "../validations/auction.schema";

// 1. API Tạo phiên đấu giá mới (Dành cho Người bán - Bắt buộc Đăng nhập)
export async function createAuction(req: AuthRequest, res: Response) {
  try {
    console.log(req.body);

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
        category: validatedData.category,
        condition: validatedData.condition,
        startPrice: startPriceBigInt,
        stepPrice: stepPriceBigInt,
        currentPrice: startPriceBigInt,
        sellerId: sellerId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
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
    console.error("❌ Lỗi chi tiết tại createAuction:", error);

    // 💡 SỬA TẠI ĐÂY: Dùng error.issues thay vì error.errors
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Dữ liệu gửi lên không hợp lệ",
        details: error.issues.map((e) => e.message),
      });
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

    const formattedAuctions = auctions.map((a) => ({
      ...a,
      startPrice: a.startPrice.toString(),
      stepPrice: a.stepPrice.toString(),
      currentPrice: a.currentPrice.toString(),
    }));

    return res.json({ auctions: formattedAuctions });
  } catch (error) {
    console.error("❌ Lỗi chi tiết tại getAuctions:", error);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
}
