import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const appointmentId = searchParams.get('appointmentId');
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log("Fetched Appointments:", data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to verify payment after returning from Stripe
  const verifyStripePayment = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-stripe",
        { success, appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments(); // Refresh the list to remove the "Pay Online" button
        navigate('/my-appointments'); // Clean up the URL so it doesn't stay there
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Run this effect only if the URL has Stripe parameters
  useEffect(() => {
    if (token && success && appointmentId) {
      verifyStripePayment();
    }
  }, [token, success, appointmentId]);

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to initiate Stripe Payment
  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-stripe",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        // This takes the user away from your site and sends them to Stripe's secure checkout
        window.location.replace(data.session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  
  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => {
          const address = item.docData.address || {};

          return (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{address.line1 || "Line 1 missing"}</p>
                <p className="text-xs">{address.line2 || "Line 2 missing"}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                
                {/* 1. PAY ONLINE BUTTON */}
                {/* 1. PAY ONLINE BUTTON */}
{!item.cancelled && !item.isCompleted && !item.payment && (
  <button 
    onClick={() => appointmentStripe(item._id)} 
    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
  >
    Pay Online
  </button>
)}

                {/* 2. CANCEL BUTTON */}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel appointment
                  </button>
                )}

                {/* 3. DOWNLOAD PRESCRIPTION BUTTON (NEW FEATURE) */}
                {item.prescriptionUrl && (
                  <a 
                    href={item.prescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-center sm:min-w-48 py-2 border rounded bg-primary text-white hover:bg-indigo-600 transition-all duration-300"
                  >
                    Download Prescription
                  </a>
                )}

                {/* 4. CANCELLED STATUS */}
                {item.cancelled && (
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                    Appointment cancelled
                  </button>
                )}

                {/* 5. COMPLETED STATUS (If no prescription is generated yet) */}
                {item.isCompleted && !item.prescriptionUrl && (
                   <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                    Appointment Completed
                 </button>
                )}
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;