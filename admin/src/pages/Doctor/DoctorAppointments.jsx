import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    backendUrl, // Make sure backendUrl is available in your DoctorContext!
  } = useContext(DoctorContext);
  
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  // --- NEW: State for our Prescription Input ---
  const [showPrescriptionId, setShowPrescriptionId] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  // --- NEW: Function to send text to our backend PDF generator ---
  const submitPrescription = async (appointmentId) => {
    if (!prescriptionText.trim()) {
      return toast.warning("Please type a prescription first.");
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/generate-prescription",
        { appointmentId, prescriptionText },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success("Prescription generated & sent to patient!");
        setShowPrescriptionId(null); // Close the text box
        setPrescriptionText(""); // Clear the text
        getAppointments(); // Refresh the list so the "View Rx" button appears
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5 ">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        
        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.userData.image}
                className="w-8 rounded-full"
                alt=""
              />{" "}
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            
            {/* --- UPDATED ACTION COLUMN --- */}
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              
              // If completed, check if prescription exists
              item.prescriptionUrl ? (
                <a 
                  href={item.prescriptionUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary text-xs font-medium underline"
                >
                  View Rx PDF
                </a>
              ) : showPrescriptionId === item._id ? (
                
                // Show the Textbox if "Write Rx" was clicked
                <div className="flex flex-col gap-2 relative z-10">
                  <textarea
                    className="border border-gray-300 rounded p-1 text-xs w-32 sm:w-40 focus:outline-primary"
                    rows={3}
                    placeholder="Type medicines..."
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => submitPrescription(item._id)} 
                      className="bg-primary text-white text-[10px] px-2 py-1 rounded hover:bg-indigo-600 transition-all"
                    >
                      Send
                    </button>
                    <button 
                      onClick={() => {setShowPrescriptionId(null); setPrescriptionText("");}} 
                      className="bg-gray-400 text-white text-[10px] px-2 py-1 rounded hover:bg-gray-500 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                
                // Show completed status and "Write Rx" button
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-green-500 text-xs font-medium">Completed</p>
                  <button 
                    onClick={() => setShowPrescriptionId(item._id)} 
                    className="text-[10px] border border-primary text-primary px-2 py-1 rounded-full hover:bg-primary hover:text-white transition-all"
                  >
                    Write Rx
                  </button>
                </div>
              )

            ) : (
              // Not completed yet - show standard tick/cancel icons
              <div className="flex">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt="Cancel"
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt="Complete"
                />
              </div>
            )}
            {/* --- END ACTION COLUMN --- */}

          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;