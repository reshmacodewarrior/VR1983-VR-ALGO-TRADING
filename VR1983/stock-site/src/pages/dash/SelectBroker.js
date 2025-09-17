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
    { value: "zerodha", label: "Zerodha", color: "from-blue-600 to-blue-700" },
    { value: "upstox", label: "Upstox", color: "from-purple-600 to-purple-700" },
    { value: "angel", label: "Angel One", color: "from-red-600 to-red-700" },
    { value: "groww", label: "Groww", color: "from-green-600 to-green-700" },
    { value: "ICICI Direct", label: "ICICI Direct", color: "from-indigo-600 to-indigo-700" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
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
            <div className="w-2 h-2 bg-blue-400 rounded-full opacity-20"></div>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Link2 className="h-8 w-8 text-blue-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect Broker Account</h1>
          <p className="text-blue-200 text-sm">
            Securely connect your trading account to start algorithmic trading
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Broker Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Select Broker
              </label>
              <select
                name="broker_name"
                value={formData.broker_name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Key size={16} className="text-blue-600" />
                API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="api_Key"
                  value={formData.api_Key}
                  onChange={handleChange}
                  placeholder="Enter your API Key"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                  required
                />
                <Server className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* API Secret */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                API Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  name="api_Secret"
                  value={formData.api_Secret}
                  onChange={handleChange}
                  placeholder="Enter your API Secret Key"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
              <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-blue-700 text-xs">
                Your API credentials are encrypted and stored securely. We never store your passwords.
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-xl ${
                messageType === "success" 
                  ? "bg-green-50 border border-green-200 text-green-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
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
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Need help finding your API credentials?{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
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