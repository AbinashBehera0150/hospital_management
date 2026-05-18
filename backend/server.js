import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import doctorModel from "./models/doctorModel.js";
import http from "http";
import { Server } from "socket.io";

// app config
const app = express();
const port = process.env.PORT || 4000;
// connect mongodb database
connectDB();
// connect to cloudinary storage
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// 1. Wrap your Express app in an HTTP server
const server = http.createServer(app); 

// 2. Initialize Socket.io and configure CORS to accept connections from your Vercel frontends
const io = new Server(server, {
  cors: {
    origin: "*", // Accepts all origins. For production, you can lock this down to your Vercel URLs later!
    methods: ["GET", "POST"]
  }
});

// 3. Listen for connections
io.on("connection", (socket) => {
  console.log("🟢 A user connected via WebSocket:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

app.set('io', io);

// api endpoint
app.use("/api/admin", adminRouter); // localhost:4000/api/admin
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API WORKING !");
});

app.patch("/update-address", async (req, res) => {
  const { doctorId, line1, line2 } = req.body;

  try {
    await doctorModel.updateOne(
      { _id: doctorId },
      {
        $set: {
          "address.line1": line1,
          "address.line2": line2,
        },
      }
    );

    res.json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update address" });
  }
});
// start the express app
server.listen(port, () => console.log("Server started", port));
