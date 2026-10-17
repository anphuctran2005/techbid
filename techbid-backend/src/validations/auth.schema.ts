import { z } from "zod";

// Schema kiểm tra dữ liệu gửi lên khi Đăng ký (Register)
export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email không được để trống" })
    .email("Email không đúng định dạng"),
  password: z
    .string({ required_error:'Mật khẩu không được để trống'})
    .min(6,'Mật khẩu phải chứa ít nhất 6 ký tự'),
  name: z
    .string({required_error:'Tên không được để trống'})
    .min(2,'Tên phải chứa ít nhất 2 ký tự'),
});

// Schema kiểm tra dữ liệu gửi lên khi Đăng nhập (Login)
export const loginSchema = z.object({
  email:z
    .string({required_error:'Email không được để trống'})
    .email('Email không đúng định dạng'),
  password: z
    .string({required_error:'Mật khẩu không được để trống'}),
});