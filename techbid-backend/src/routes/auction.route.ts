import { Router } from "express";
import { createAuction, getAuctions } from "../controllers/auction.controller";
import { placeBid } from "../controllers/bid.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Lấy danh sách phiên đấu giá (Công khai)
router.get("/", getAuctions);

// Tạo phiên đấu giá (Chỉ dành cho người đã đăng nhập -> Cần authenticate)
router.post("/", authenticate, createAuction);

// Đặt giá cho phiên đấu giá (Cần đăng nhập)
router.post("/:id/bid", authenticate, placeBid);

export default router;
