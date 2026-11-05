import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";

// Định nghĩa giao diện Request mở rộng có chứa thông tin user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        error: "Không tìm thấy Token xác thực (Yêu cầu định dạng Bearer Token)",
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    console.log("👉 Token giải mã thành công, thông tin user:", decoded);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("❌ Lỗi xác thực JWT chi tiết:", error.message);
    return res
      .status(401)
      .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
}
