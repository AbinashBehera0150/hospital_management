import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login Successful", token});
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for Frontend : /api/doctor/list
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailability = async (req, res) => {
  try {
    const docId = req.docId;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { fees, address, available } = req.body;
    const docId = req.docId;

    // ✅ Validate address format
    if (typeof address !== "object" || !address.line1 || !address.line2) {
      return res.json({ success: false, message: "Invalid address format" });
    }

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to generate and save a Professional PDF prescription locally
const generatePrescription = async (req, res) => {
  try {
    const { appointmentId, prescriptionText } = req.body;
    const docId = req.docId;

    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData || appointmentData.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized or Appointment not found" });
    }

    if (!appointmentData.isCompleted) {
      return res.json({ success: false, message: "Cannot generate prescription for incomplete appointment" });
    }

    // Set up standard A4 document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Save locally for Thunder Client bypass
    const filePath = `./Prescription-${appointmentId}.pdf`;
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ==========================================
    // BRANDING & BORDERS
    // ==========================================
    // This matches the blue from your frontend screenshot
 // ==========================================
    // BRANDING & BORDERS
    // ==========================================
    // This matches the blue from your frontend screenshot
    const brandBlue = "#4F46E5"; 

    // Draw Full Page Border (Left, Top, Width, Height)
    doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor(brandBlue).stroke();

    // ==========================================
    // BACKGROUND WATERMARK LOGO
    // ==========================================
    try {
        // Save the normal graphics state
        doc.save();
        
        // Drop the opacity to 10% so it looks like a watermark
        doc.opacity(0.1);
        
        // A4 paper is ~595 points wide. 
        // A 300px wide image centered is at X: 147, and we drop it to Y: 270 to center it vertically.
        doc.image('./logo.png', 147, 270, { width: 300 });
        
        // CRITICAL: Restore the normal graphics state so your text isn't transparent!
        doc.restore();
    } catch(e) {
        console.log("Logo not found. Make sure logo.png is in the backend folder.");
    }
    // ==========================================
    // 1. HOSPITAL HEADER & LOGO
    // ==========================================
    try {
        // This will grab the logo.png file you put in your backend folder!
        doc.image('./logo.png', 50, 45, { width: 120 });
    } catch(e) {
        console.log("Logo not found. Make sure logo.png is in the backend folder.");
    }

    // Align header text to the right side so it sits across from the logo
    doc.fontSize(24).font('Helvetica-Bold').fillColor(brandBlue).text("Prescripto", 50, 50, { align: "right" });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').fillColor("gray").text("123 Health Avenue, Medical District", { align: "right" });
    doc.text("Phone: +1 800-555-0199 | Email: contact@prescripto.com", { align: "right" });
    doc.moveDown(1);

    // Top Divider Line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").lineWidth(1).stroke();
    doc.moveDown(1);

    // ==========================================
    // 2. DOCTOR & PATIENT DEMOGRAPHICS
    // ==========================================
    const topY = doc.y;

    // Fix the "Dr. Dr." bug
    const rawDocName = appointmentData.docData.name;
    const doctorName = rawDocName.startsWith("Dr.") ? rawDocName : `Dr. ${rawDocName}`;

    // Left Column: Doctor Info
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlue).text(doctorName, 50, topY);
    doc.fontSize(10).font('Helvetica').fillColor("black").text(`${appointmentData.docData.degree} - ${appointmentData.docData.speciality}`);
    doc.text(`Reg No: MED-${appointmentData.docData._id.toString().slice(-6).toUpperCase()}`);

    // Right Column: Patient Info
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlue).text(`Patient: ${appointmentData.userData.name}`, 300, topY);
    doc.fontSize(10).font('Helvetica').fillColor("black").text(`Gender: ${appointmentData.userData.gender || 'Not Specified'} | DOB: ${appointmentData.userData.dob || 'Not Specified'}`, 300);
    doc.text(`Phone: ${appointmentData.userData.phone || 'N/A'}`, 300);

    doc.moveDown(1.5);

    // ==========================================
    // 3. APPOINTMENT METADATA
    // ==========================================
    doc.fontSize(10).font('Helvetica-Oblique').fillColor("gray").text(
        `Consultation Date: ${appointmentData.slotDate}  |  Time: ${appointmentData.slotTime}  |  Appt ID: ${appointmentId.slice(-6).toUpperCase()}`, 
        50
    );
    doc.moveDown(0.5);

    // Middle Divider Line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(1.5);

    // ==========================================
    // 4. THE PRESCRIPTION (Rx)
    // ==========================================
    doc.fillColor(brandBlue);
    doc.fontSize(24).font('Helvetica-Bold').text("Rx", 50, doc.y);
    doc.moveDown(0.5);

    doc.fillColor("black");
    doc.fontSize(12).font('Helvetica').text(prescriptionText, { align: "left", lineGap: 6 });

    // ==========================================
    // 5. SIGNATURE & EMERGENCY CONTACT BOTTOM BORDER
    // ==========================================
    const signatureY = 620; 
    doc.moveTo(400, signatureY).lineTo(545, signatureY).strokeColor("black").stroke();
    doc.fontSize(10).font('Helvetica').text("Doctor's Signature", 400, signatureY + 5, { align: "center", width: 145 });

    // The Bottom Blue Border
    const bottomBorderY = 700;
    doc.moveTo(50, bottomBorderY).lineTo(545, bottomBorderY).strokeColor(brandBlue).lineWidth(2).stroke();

    // Emergency Contacts Section (Below the border)
    doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlue).text("EMERGENCY CONTACTS", 50, bottomBorderY + 15, { align: "center" });
    doc.fontSize(10).font('Helvetica').fillColor("black").text("Ambulance: 102  |  Hospital Reception: +1 800-555-0000  |  24/7 Helpline: 104", { align: "center" });

    doc.fontSize(8).fillColor('gray').text(
      "This is a digitally generated electronic prescription. Not valid for medico-legal purposes without a physical signature.",
      50, 780, { align: "center" }
    );

    // Finalize the PDF
    doc.end();

    // Wait for the file to finish saving locally
    writeStream.on('finish', async () => {
        try {
            // 1. Upload the local PDF to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(filePath, {
                resource_type: "raw", // "raw" tells Cloudinary not to mess with the file's internal data
                folder: "prescriptions",
                // Notice we added .pdf directly into the name here!
                public_id: `Prescription-${appointmentId}.pdf` 
            });

            const prescriptionUrl = imageUpload.secure_url;

            // 2. Save the Cloudinary URL to the MongoDB Appointment document
            await appointmentModel.findByIdAndUpdate(appointmentId, { prescriptionUrl });

            // 3. Delete the temporary local PDF file from your backend folder
            fs.unlinkSync(filePath);

            // 4. Send the success response back to the frontend/Thunder Client
            res.json({ 
                success: true, 
                message: "Prescription generated and uploaded to Cloudinary successfully!",
                prescriptionUrl 
            });

        } catch (error) {
            console.log("Cloudinary Upload Error:", error);
            res.json({ success: false, message: "PDF generated locally, but failed to upload to the cloud." });
        }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailability,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  generatePrescription,
  updateDoctorProfile,
};
