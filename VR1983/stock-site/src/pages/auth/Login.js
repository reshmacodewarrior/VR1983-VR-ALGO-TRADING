import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Zap, BarChart3, Rocket, Shield, Globe } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../../asset/vrlogo.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Primary color from sidebar
  const primaryColor = "#42a5f5";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const res = await login(form.username, form.password);
    if (res.success) {
      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span>Welcome to VR ALGO Trading Platform</span>
        </div>
      );
      navigate("/");
    } else {
      toast.error(res.message || "❌ Login failed");
      setError(res.message || "Invalid credentials");
    }
    setIsLoading(false);
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
              <img src={logo} alt="VR Algo Trading" className="h-12 w-12" />
              <h1 className="text-2xl font-bold text-white">
                VR ALGO TRADING
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
            <p className="text-blue-100 text-lg mb-8">
              Access the most advanced algorithmic trading platform with real-time analytics and AI-powered insights.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-100" size={20} />
              <span className="text-blue-100">Real-time market data</span>
            </div>
            <div className="flex items-center gap-3">
              <Rocket className="text-blue-100" size={20} />
              <span className="text-blue-100">Advanced trading algorithms</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-blue-100" size={20} />
              <span className="text-blue-100">Secure & encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="text-blue-100" size={20} />
              <span className="text-blue-100">Global market access</span>
            </div>
          </div>
        </div>

        {/* Right section - Login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <div className="text-center mb-8">
            <div className="md:hidden flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="VR Algo Trading" className="h-10 w-10" />
                <h1 
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  VR ALGO TRADING
                </h1>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                  style={{ focusRingColor: primaryColor }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded focus:ring-2 focus:ring-offset-2 border-gray-300"
                  style={{ 
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              
              <Link
                to="/forgotpassword"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: primaryColor }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold transition-colors hover:underline"
                style={{ color: primaryColor }}
              >
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By signing in, you agree to our{" "}
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