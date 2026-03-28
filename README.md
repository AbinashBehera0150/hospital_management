# 🏥 Prescripto - Full-Stack Hospital Management System

A comprehensive, role-based MERN stack application designed to streamline hospital operations. It features dedicated portals for Patients, Doctors, and Hospital Administrators, complete with real-time appointment booking, secure online payments, and automated prescription generation.

###  Live Demos
* **Patient Portal:** [https://hospital-management-two-rho.vercel.app]
* **Admin & Doctor Portal:** [https://hospital-management-admin-red.vercel.app]
* **Backend API:** [https://hospital-management-backend-f51w.onrender.com]

---

## Key Features

###  For Patients
* **Find Doctors:** Browse and filter hospital doctors by specialty.
* **Book Appointments:** Real-time availability checking and slot booking.
* **Secure Payments:** Integrated with Stripe for seamless appointment checkout.
* **Email Notifications:** Automated email updates for booking confirmations.

###  For Doctors
* **Private Dashboard:** Secure login using JWT authentication.
* **Manage Appointments:** View upcoming patients, mark appointments as completed (✅) or cancelled (❌).
* **Automated Prescriptions:** Generate downloadable PDF prescriptions for completed appointments.

###  For Administrators
* **Hospital Overview:** Dashboard displaying total revenue, patient count, and system metrics.
* **Staff Management:** Add new doctors and securely upload their profiles via Cloudinary.
* **System Control:** Ability to oversee and override all system appointments.

---

##  Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **File Storage:** Cloudinary
* **Payment Gateway:** Stripe
* **Email Service:** Nodemailer
* **Deployment:** Vercel (Frontends) & Render (Backend)

---

## Run Locally

If you want to run this project on your local machine, follow these steps:

**1. Clone the repository**
```bash
git clone [https://github.com/AbinashBehera0150/hospital_management.git](https://github.com/AbinashBehera0150/hospital_management.git)

2. Setup the Backend

cd backend
npm install
Create a .env file in the backend directory and add your MongoDB, Cloudinary, Stripe, and JWT secret keys.

Bash
npm run server
3. Setup the Frontends
Open two new terminals.

Bash
# Terminal 1 - Patient App
cd frontend
npm install
npm run dev

# Terminal 2 - Admin/Doctor App
cd admin
npm install
npm run dev