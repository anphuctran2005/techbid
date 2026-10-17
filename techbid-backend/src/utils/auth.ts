import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default_fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 1. Hàm băm mật khẩu thô thành chuỗi băm an toàn
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// 2. Hàm so sánh mật khẩu người dùng nhập vào với chuỗi băm trong CSDL
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// 3. Hàm tạo JWT Token khi đăng nhập/đăng ký thành công
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 4. Hàm giải mã và kiểm tra tính hợp lệ của JWT Token
export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
}