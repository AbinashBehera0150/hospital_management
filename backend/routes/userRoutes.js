import express from "express";
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';
// Import the new functions at the top
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, sendResetOtp, resetPassword,paymentStripe,verifyStripe } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.get("/appointments", authUser, listAppointment)


// Add these two lines to your routes
userRouter.post('/send-reset-otp', sendResetOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/payment-stripe', authUser, paymentStripe);
userRouter.post('/verify-stripe', authUser, verifyStripe);
export default userRouter;
