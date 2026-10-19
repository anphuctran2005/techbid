import {Request, Response, NextFunction} from 'express';
import { verifyToken } from '../utils/auth';

// Định nghĩa giao diện Request mở rộng có chứa thông tin user
export interface AuthRequest extends Request{
    user?:{
        userId: string;
        email: string;
    };
}

export function authenticate(req: AuthRequest, res:Response,next:NextFunction){
    // Lấy chuỗi Token từ Header 'Authorization' gửi lên
    const authHeader = req.headers.authorization;

    // Kiểm tra định dạng chuẩn: 'Bearer <token>'
    if(!authHeader || !authHeader.startsWith('Bearer')) {
        return res
            .status(401)
            .json({error:'Không tìm thấy Token xác thực (Yêu cầu định dạng Bearer Token)'});
    }

    const token = authHeader.split(' ')[1];

    try{
        // Giải mã và kiểm tra con dấu JWT
        const decoded= verifyToken(token);

        // Gán thông tin user giải mã được vào req.user để các Controller sau sử dụng
        req.user = decoded;

        // Cho phép đi tiếp vào Controller chính
        next();
    }
    catch(error){
        return res
            .status(401)
            .json({error:'Token không hợp lệ hoặc đã hết hạn'});
    }
}