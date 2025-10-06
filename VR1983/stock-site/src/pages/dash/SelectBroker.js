import React, { useState } from "react";
import axios from "axios";
import { 
  Building2, 
  Key, 
  Lock, 
  Link2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Server
} from "lucide-react";
import { toast } from "react-toastify";

export default function BrokerAccountForm() {
  const [formData, setFormData] = useState({
    broker_name: "",
    api_Key: "",
    api_Secret: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Primary color for the theme
  const primaryColor = "#42a5f5";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Build payload to match backend field names
      const payload = {
        broker_name: formData.broker_name,
        api_key: formData.api_Key,
        api_secret: formData.api_Secret,
      };

      // Retrieve token
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ No authentication token found. Please login first.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // API request
      const response = await axios.post(
        "http://192.168.1.58:8000/api/broker/add",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Success
      console.log("Response:", response.data);
      setMessage("Broker account connected successfully!");
      setMessageType("success");
      
      // Show success toast
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>Broker account connected successfully!</span>
        </div>
      );
      
      // Reset form
      setFormData({
        broker_name: "",
        api_Key: "",
        api_Secret: "",
      });
      
    } catch (error) {
      // ❌ Error handling
      let errorMessage = "Failed to connect broker account";
      
      if (error.response) {
        // Backend returned an error response
        console.error("Backend Error:", error.response.data);
        errorMessage = error.response.data.message || "Server error";
      } else if (error.request) {
        // No response received
        console.error("Network Error:", error.request);
        errorMessage = "No response from server. Check network connection.";
      } else {
        // Other errors
        console.error("Error:", error.message);
        errorMessage = error.message;
      }
      
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
      
      // Show error toast
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const brokers = [
    { value: "zerodha", label: "Zerodha" },
    { value: "upstox", label: "Upstox" },
    { value: "angel", label: "Angel One" },
    { value: "groww", label: "Groww" },
    { value: "ICICI Direct", label: "ICICI Direct" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          >
            <div 
              className="w-2 h-2 rounded-full opacity-20"
              style={{ backgroundColor: primaryColor }}
            ></div>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Card */}
        <div 
          className="bg-white border rounded-2xl p-6 mb-6 text-center shadow-lg"
          style={{ borderColor: `${primaryColor}20` }}
        >
          <div className="flex justify-center mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Link2 style={{ color: primaryColor }} className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>Connect Broker Account</h1>
          <p className="text-gray-600 text-sm">
            Securely connect your trading account to start algorithmic trading
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-6" style={{ borderColor: `${primaryColor}20` }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Broker Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: primaryColor }}>
                <Building2 size={16} />
                Select Broker
              </label>
              <select
                name="broker_name"
                value={formData.broker_name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors appearance-none bg-white"
                style={{
                  borderColor: `${primaryColor}40`,
                  focusRingColor: primaryColor
                }}
                required
              >
                <option value="">-- Choose Your Broker --</option>
                {brokers.map((broker) => (
                  <option key={broker.value} value={broker.value}>
                    {broker.label}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: primaryColor }}>
                <Key size={16} />
                API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="api_Key"
                  value={formData.api_Key}
                  onChange={handleChange}
                  placeholder="Enter your API Key"
                  className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors pr-10"
                  style={{
                    borderColor: `${primaryColor}40`,
                    focusRingColor: primaryColor
                  }}
                  required
                />
                <Server className="absolute right-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: primaryColor }} />
              </div>
            </div>

            {/* API Secret */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: primaryColor }}>
                <Lock size={16} />
                API Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  name="api_Secret"
                  value={formData.api_Secret}
                  onChange={handleChange}
                  placeholder="Enter your API Secret Key"
                  className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors pr-10"
                  style={{
                    borderColor: `${primaryColor}40`,
                    focusRingColor: primaryColor
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{ color: primaryColor }}
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div 
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ 
                backgroundColor: `${primaryColor}05`,
                border: `1px solid ${primaryColor}20`
              }}
            >
              <Shield className="mt-0.5 flex-shrink-0" size={16} style={{ color: primaryColor }} />
              <p className="text-xs" style={{ color: primaryColor }}>
                Your API credentials are encrypted and stored securely. We never store your passwords.
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div 
                className={`p-3 rounded-xl border ${
                  messageType === "success" 
                    ? "bg-green-50 border-green-200 text-green-700" 
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {messageType === "success" ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600" />
                  )}
                  <span className="text-sm">{message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105"
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#1e88e5';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.backgroundColor = primaryColor;
              }}
            >
              {isLoading ? (
                <>
                  <div 
                    className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                  ></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 size={20} />
                  Connect Broker Account
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: `${primaryColor}20` }}>
            <p className="text-xs text-center text-gray-600">
              Need help finding your API credentials?{" "}
              <a href="#" className="font-medium hover:underline" style={{ color: primaryColor }}>
                View our guide
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.3;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}