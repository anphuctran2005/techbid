import { z } from "zod";

export const createAuctionSchema = z.object({
  title: z
    .string({ required_error: "Tên sản phẩm không được để trống" })
    .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  description: z.string({ required_error: "Mô tả không được để trống" }),
  catetory: z.string({ required_error: "Danh mục không được để trống" }),
  condition: z.enum(["BRAND_NEW", "LIKE_NEW_99", "USED_GOOD"], {
    errorMap: () => ({ message: "Tình trạng hàng hóa không hợp lệ" }),
  }),
  startPrice: z
    .number({ required_error: "Giá khởi điểm không được để trống" })
    .positive("Giá khởi điểm phải lớn hơn 0"),
  stepPrice: z
    .number({ required_error: "Bước giá không được để trống" })
    .positive("Bước giá phải lớn hơn 0"),
  startTime: z
    .string({ required_error: "Thời gian bắt đầu không được để trống" })
    .datetime("Thời gian bắt đầu phải chuẩn định dạng ISO Date"),
  endTime: z
    .string({ required_error: "Thời gian kết thúc không được để trống" })
    .datetime("Thời gian kết thúc phải chuẩn định dạng ISO Date"),
});
