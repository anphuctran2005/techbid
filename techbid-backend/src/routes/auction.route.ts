import { Router } from "express";
import { createAuction, getAuctions } from "../controllers/auction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Lấy danh sách phiên đấu giá (Công khai)
router.get("/", getAuctions);

// Tạo phiên đấu giá (Chỉ dành cho người đã đăng nhập -> Cần authenticate)
router.post("/", authenticate, createAuction);

export default router;
