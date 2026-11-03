import { z } from "zod";

export const placeBidSchema = z.object({
  amount: z
    .number({ required_error: "Số tiền đặt giá không được để trống" })
    .positive("Số tiền đặt giá phải lớn hơn không"),
});
