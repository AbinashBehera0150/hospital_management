import express from "express";
import { changeAvailability } from "../controllers/doctorController.js";
import authAdmin from "../middleware/authAdmin.js";
import {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
// whenever we will call this endpoint then we have to send this image in form data in field name'image', then our middleware will process this image and form data
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor); 
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/dashboard", authAdmin, adminDashboard)

export default adminRouter;
