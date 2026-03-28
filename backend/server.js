import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import doctorModel from "./models/doctorModel.js";

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
app.listen(port, () => console.log("Server started", port));
