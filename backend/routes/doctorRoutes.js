import express from "express";
import authDoctor from '../middleware/authDoctor.js';
import { loginDoctor, doctorList,appointmentsDoctor,appointmentComplete,appointmentCancel,doctorDashboard,doctorProfile, updateDoctorProfile,generatePrescription } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/list", doctorList);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)
doctorRouter.post("/generate-prescription", authDoctor, generatePrescription);
/*
doctorRouter.post("/change-availability", authDoctor, changeAvailability)

*/
export default doctorRouter;
