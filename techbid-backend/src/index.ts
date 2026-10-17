import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route';

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// Đăng ký Router Auth với tiền tố /api/auth
app.use('/api/auth',authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'TechBid API Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});