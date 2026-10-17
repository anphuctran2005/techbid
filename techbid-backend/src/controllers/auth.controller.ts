import { Request, Response } from "express";
import {prisma} from '../lib/prisma';
import {hashPassword, comparePassword, generateToken} from '../utils/auth';
import { registerSchema,loginSchema } from './../validations/auth.schema';

// 1. API Đăng ký tài khoản
export async function register(req: Request, res: Response){
    try {
        // Kiểm tra dữ liệu đầu vào bằng Zod
        const validatedData = registerSchema.parse(req.body);

        // Kiểm tra xem email đã tồn tại trong CSDL chưa
        const existingUser =await prisma.user.findUnique({
            where: {email: validatedData.email},
        });

        if(existingUser){
            return res.status(400).json({error: 'Email này đã được sử dụng'});
        }

        // Băm mật khẩu bằng Bcrypt
        const hashedPassword = await hashPassword(validatedData.password);

        // Tạo người dùng mới trong CSDL
        const user= await prisma.user.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                passwordHash: hashedPassword,
            },
        });

        // Tạo JWT Token
        const token = generateToken({userId: user.id,email: user.email});

        // Trả về thông tin người dùng (không trả về passwordHash) và Token
        return res.status(201).json({
            message:'Đăng ký tài khoản thành công',
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                balance: user.balance.toString(), // Chuyển BigInt sang string để gửi qua JSON
            },
            token,
        });
    }
    catch (error: any){
        if(error.errors){
            return res.status(400).json({error: error.errors[0].message});
        }
        return res.status(500).json({error:'Lỗi máy chủ nội bộ'});
    }
}

// 2. API Đăng nhập
export async function login(req: Request, res:Response){
    try{
        // Kiểm tra dữ liệu đầu vào bằng Zod
        const validatedData = loginSchema.parse(req.body);


        // Tìm người dùng theo email
        const user = await prisma.user.findUnique({
            where: {email:validatedData.email},
        });

        if(!user){
            return res.status(401).json({error:'Email hoặc mật khẩu không chính xác'});
        }

        // So sánh mật khẩu nhập vào với mật khẩu đã băm trong CSDL
        const isPasswordValid = await comparePassword(
            validatedData.password,
            user.passwordHash
        );

        if(!isPasswordValid){
            return res.status(401).json({error: 'Email hoặc mật khẩu không chính xác'});
        }

        // Tạo JWT Token
        const token = generateToken({userId:user.id, email: user.email});

        return res.json({
            message:'Đăng nhập thành công',
            user:{
                id: user.id,
                email:user.email,
                name: user.name,
                balance:user.balance.toString(),
            },
            token,
        });
    } catch(error:any){
        if(error.errors){
            return res.status(400).json({error: error.errors[0].message});
        }
        return res.status(500).json({error: 'Lỗi máy chủ nội bộ'});
    }
}