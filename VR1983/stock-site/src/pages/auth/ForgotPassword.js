import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Zap } from "lucide-react";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Primary color from sidebar
  const primaryColor = "#42a5f5";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setMessage(`Password reset link sent to ${form.email} (simulate backend).`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-2xl p-10 rounded-2xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Lock size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800 tracking-tight">
            Reset Password
          </h2>
          <p className="text-gray-600">Enter your details to reset your password</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: primaryColor }}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="New Password"
                className="w-full pl-10 p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: primaryColor }}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: primaryColor }}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Zap size={20} />
            Reset Password
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium transition-colors hover:underline"
            style={{ color: primaryColor }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}