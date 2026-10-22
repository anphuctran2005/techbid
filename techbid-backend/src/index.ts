import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import auctionRoutes from "./routes/auction.route";
import authRoutes from "./routes/auth.route";

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// 1. Route Xác thực
app.use("/api/auth", authRoutes);

// 2. Route Phiên Đấu giá
app.use("/api/auctions", auctionRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "TechBid API Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
