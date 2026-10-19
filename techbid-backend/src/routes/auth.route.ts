import { Router } from "express";
import {register, login, getMe} from '../controllers/auth.controller';
import {authenticate} from '../middlewares/auth.middleware';

const router = Router();

router.post('/register',register);
router.post('/login',login);

// Route /me được bảo vệ bởi middleware authenticate
router.get('/me', authenticate, getMe);

export default router;