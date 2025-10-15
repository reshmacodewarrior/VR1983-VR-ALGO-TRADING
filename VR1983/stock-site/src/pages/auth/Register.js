import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, Phone, Eye, EyeOff, Zap, BarChart3, Rocket, Shield, Globe, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    mobile_no: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Primary color from sidebar
  const primaryColor = "#42a5f5";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Form data being submitted:", form);

    try {
      const res = await register(
        form.username,
        form.firstname,
        form.lastname,
        form.email,
        form.mobile_no,
        form.password
      );

      console.log("Registration response:", res);

      if (res.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Registration successful! Please login.</span>
          </div>
        );
        navigate("/login");
      } else {
        const errorMessage = res.message || "Registration failed. Please try again.";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setForm({ ...form, password: newPassword });
    checkPasswordStrength(newPassword);
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "bg-gray-300";
      case 1: return "bg-red-400";
      case 2: return "bg-orange-400";
      case 3: return "bg-yellow-400";
      case 4: return primaryColor;
      case 5: return "bg-green-400";
      default: return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="relative flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-4xl border border-gray-200">
        {/* Left section - Brand showcase */}
        <div 
          className="hidden md:flex flex-col justify-between w-1/2 p-10 text-white relative overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-300 rounded-full filter blur-xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                VR ALGO TRADING
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">Join Us Today</h2>
            <p className="text-blue-100 text-lg mb-8">
              Start your algorithmic trading journey with advanced tools, real-time analytics, and AI-powered insights.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-100" size={20} />
              <span className="text-blue-100">Real-time market analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <Rocket className="text-blue-100" size={20} />
              <span className="text-blue-100">Advanced trading algorithms</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-blue-100" size={20} />
              <span className="text-blue-100">Bank-level security</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="text-blue-100" size={20} />
              <span className="text-blue-100">Global market access</span>
            </div>
          </div>
        </div>

        {/* Right section - Registration form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <div className="text-center mb-8">
            <div className="md:hidden flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Zap className="h-6 w-6" />
                </div>
                <h1 
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  VR ALGO TRADING
                </h1>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our trading platform today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                    style={{ focusRingColor: primaryColor }}
                    value={form.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                    style={{ focusRingColor: primaryColor }}
                    value={form.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  minLength={3}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">3-50 characters, letters, numbers, and underscores only</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  placeholder="+919876543210"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.mobile_no}
                  onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">Optional - 10-15 digits with optional country code</p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 1 ? "text-red-500" :
                      passwordStrength === 2 ? "text-orange-500" :
                      passwordStrength === 3 ? "text-yellow-500" :
                      passwordStrength === 4 ? "text-blue-500" : "text-green-500"
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Password requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className={form.password.length >= 8 ? "text-green-500" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? "text-green-500" : ""}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(form.password) ? "text-green-500" : ""}>
                    One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(form.password) ? "text-green-500" : ""}>
                    One number
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold transition-colors hover:underline"
                style={{ color: primaryColor }}
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By creating an account, you agree to our{" "}
              <a href="#" className="hover:underline" style={{ color: primaryColor }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline" style={{ color: primaryColor }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}