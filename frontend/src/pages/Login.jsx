import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Upgraded states to handle the OTP flow
  const [state, setState] = useState("Login"); // "Sign Up", "Login", "Forgot Password", "Reset Password"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  // State for the eye icon toggle
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Signup successful");
        } else {
          toast.error(data.message || "Signup failed");
        }
      } else if (state === "Login") {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Login successful");
        } else {
          toast.error(data.message || "Login failed");
        }
      } else if (state === "Forgot Password") {
        // --- NEW: SEND OTP API CALL ---
        const { data } = await axios.post(backendUrl + "/api/user/send-reset-otp", { email });
        if (data.success) {
          toast.success(data.message);
          setState("Reset Password"); // Move to the next screen to enter the code
        } else {
          toast.error(data.message);
        }
      } else if (state === "Reset Password") {
        // --- NEW: VERIFY OTP & RESET API CALL ---
        const { data } = await axios.post(backendUrl + "/api/user/reset-password", { email, otp, newPassword });
        if (data.success) {
          toast.success("Password reset successfully! Please login.");
          setState("Login"); // Send them back to login
          setPassword("");
          setNewPassword("");
          setOtp("");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-3 items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg"
      >
        <p className="text-2xl font-semibold text-zinc-700">
          {state === "Sign Up" ? "Create Account" : 
           state === "Login" ? "Login" : 
           state === "Forgot Password" ? "Reset Password" : "Enter Code"}
        </p>
        <p>
          {state === "Sign Up" ? "Please sign up to book an appointment" : 
           state === "Login" ? "Please log in to book an appointment" : 
           state === "Forgot Password" ? "Enter your email to receive a 6-digit code" : 
           "Enter the OTP sent to your email and your new password."}
        </p>

        {/* FULL NAME (Only for Sign Up) */}
        {state === "Sign Up" && (
          <div className="w-full mt-2">
            <p>Full Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary"
              type="text"
              required
            />
          </div>
        )}

        {/* EMAIL (Used in Sign Up, Login, and Forgot Password) */}
        {state !== "Reset Password" && (
          <div className="w-full mt-2">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary"
              type="email"
              required
            />
          </div>
        )}

        {/* OTP INPUT (Only for Reset Password) */}
        {state === "Reset Password" && (
          <div className="w-full mt-2">
            <p>6-Digit OTP</p>
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              className="border border-[#DADADA] rounded w-full p-2 mt-1 focus:outline-primary tracking-widest text-center text-lg"
              type="text"
              maxLength="6"
              required
            />
          </div>
        )}

        {/* PASSWORD (Used in Sign Up and Login) */}
        {(state === "Sign Up" || state === "Login") && (
          <div className="w-full mt-2">
            <p>Password</p>
            <div className="relative w-full mt-1">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border border-[#DADADA] rounded w-full p-2 pr-10 focus:outline-primary"
                type={showPassword ? "text" : "password"}
                required
              />
              {/* Eye Icon Toggle */}
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-primary transition-all"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEW PASSWORD (Only for Reset Password) */}
        {state === "Reset Password" && (
          <div className="w-full mt-2">
            <p>New Password</p>
            <div className="relative w-full mt-1">
              <input
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                className="border border-[#DADADA] rounded w-full p-2 pr-10 focus:outline-primary"
                type={showPassword ? "text" : "password"}
                required
              />
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-primary transition-all"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD LINK (Only on Login screen) */}
        {state === "Login" && (
          <p 
            onClick={() => setState("Forgot Password")} 
            className="text-primary cursor-pointer hover:underline text-xs mt-1"
          >
            Forgot Password?
          </p>
        )}

        {/* MAIN SUBMIT BUTTON */}
        <button
          type="submit"
          className="bg-primary text-white w-full py-2.5 my-2 rounded-md text-base hover:bg-indigo-600 transition-all"
        >
          {state === "Sign Up" ? "Create account" : 
           state === "Login" ? "Login" : 
           state === "Forgot Password" ? "Send OTP to Email" : "Reset Password"}
        </button>

        {/* BOTTOM TOGGLE LINKS */}
        <div className="w-full text-center mt-2">
          {state === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span onClick={() => setState("Login")} className="text-primary underline cursor-pointer">Login here</span>
            </p>
          ) : state === "Login" ? (
            <p>
              Create a new account?{" "}
              <span onClick={() => setState("Sign Up")} className="text-primary underline cursor-pointer">Click here</span>
            </p>
          ) : (
            <p>
              Remember your password?{" "}
              <span onClick={() => {setState("Login"); setOtp("");}} className="text-primary underline cursor-pointer">Back to Login</span>
            </p>
          )}
        </div>

      </form>
    </div>
  );
};

export default Login;