import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Badge, Edit3, BarChart3,LogOut, Shield,Wallet} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [activeTab, setActiveTab] = useState("holdings"); // Default to holdings tab
  const { setUsername, logout } = useAuth();

  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  useEffect(() => {
    fetchProfileData();
    if (activeTab === "holdings") {
      fetchHoldings();
    }
  }, [activeTab]);

  const fetchProfileData = () => {
    fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditedProfile(data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  };

  const fetchHoldings = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    setHoldingsLoading(true);
    const res = await fetch(`${BASE_URL}/api/holding-view`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
    });

    if (res.ok) {
      const data = await res.json();

      // ✅ If backend already calculates everything, no need to reprocess
      setHoldings(data);

      // ❌ remove extra map and setHoldings inside it
    } else {
      console.error("Holdings API error:", res.status);
    }
  } catch (err) {
    console.error("Error fetching holdings:", err);
    toast.error("Failed to fetch holdings");
  } finally {
    setHoldingsLoading(false);
  }
};

  const placeOrder = async (symbol, type, qty, exchange = "NSE") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      let formattedSymbol = symbol;
      if (exchange === "NSE" && !symbol.includes(".")) formattedSymbol = `${symbol}.NS`;

      const orderData = {
        symbol: formattedSymbol,
        exchange,
        transaction_type: type.toUpperCase(),
        quantity: parseInt(qty),
        order_type: "MARKET",
        product: "CNC",
      };

      const res = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`${type} order placed successfully! Order ID: ${result.order_id}`);
        await fetchHoldings(); // Refresh holdings
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(`Failed to place order: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Server error placing order");
    }
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProfitLossColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Calculate portfolio totals
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment_value, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profit_loss, 0);
  const totalProfitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100) : 0;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
          <p className="text-blue-200">Manage your profile and portfolio</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-2xl">
                    <User size={48} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center">{profile.username}</h2>
                <p className="text-blue-300 text-sm">{profile.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("holdings")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "holdings" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <Wallet size={20} />
                  <span>My Holdings</span>
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "profile" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <User size={20} />
                  <span>Profile Information</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "security" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <Shield size={20} />
                  <span>Security</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>

            {/* Portfolio Summary Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-5 mt-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="text-green-400" size={24} />
                <h3 className="font-semibold">Portfolio Summary</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Value</span>
                  <span className="text-white font-medium">₹{totalCurrentValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total P&L</span>
                  <span className={getProfitLossColor(totalProfitLoss)}>
                    ₹{totalProfitLoss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Stocks</span>
                  <span className="text-white font-medium">{holdings.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white">
              
              {activeTab === "holdings" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Holdings</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-300">Total: {holdings.length} stocks</span>
                      <button
                        onClick={fetchHoldings}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                      >
                        <Wallet size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {holdingsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading your holdings...</p>
                    </div>
                  ) : holdings.length === 0 ? (
                    <div className="text-center py-12">
                      <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No Holdings Yet</h3>
                      <p className="text-gray-400 mb-6">Start trading to build your portfolio</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-gray-300 font-medium">Symbol</th>
                            <th className="text-left p-4 text-gray-300 font-medium">Exchange</th>
                            <th className="text-right p-4 text-gray-300 font-medium">Quantity</th>
                            <th className="text-right p-4 text-gray-300 font-medium">Avg Price</th>
                            <th className="text-right p-4 text-gray-300 font-medium">Current Price</th>
                            <th className="text-right p-4 text-gray-300 font-medium">Investment</th>
                            <th className="text-right p-4 text-gray-300 font-medium">Current Value</th>
                            <th className="text-right p-4 text-gray-300 font-medium">P&L</th>
                            <th className="text-center p-4 text-gray-300 font-medium">Risk</th>
                            <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {holdings.map((holding, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold">{holding.symbol}</div>
                              </td>
                              <td className="p-4 text-gray-300">{holding.exchange}</td>
                              <td className="p-4 text-right font-mono">{holding.quantity}</td>
                              <td className="p-4 text-right font-mono">₹{holding.average_price.toFixed(2)}</td>
                              <td className="p-4 text-right font-mono">₹{holding.current_price.toFixed(2)}</td>
                              <td className="p-4 text-right font-mono">₹{holding.investment_value.toFixed(2)}</td>
                              <td className="p-4 text-right font-mono">₹{holding.current_value.toFixed(2)}</td>
                              <td className="p-4 text-right">
                                <span className={`font-mono font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                                  ₹{holding.profit_loss.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.risk_level)}`}>
                                  {holding.risk_level}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => placeOrder(holding.symbol, "BUY", holding.quantity, holding.exchange)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors"
                                  >
                                    Buy More
                                  </button>
                                  <button
                                    onClick={() => placeOrder(holding.symbol, "SELL", holding.quantity, holding.exchange)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                                  >
                                    Sell
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === "profile" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Username</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.username || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <Badge className="text-blue-400" size={20} />
                            <span>{profile.username}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedProfile.email || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <Mail className="text-blue-400" size={20} />
                            <span>{profile.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="First name"
                              value={editedProfile.firstname || ""}
                              onChange={(e) => setEditedProfile({...editedProfile, firstname: e.target.value})}
                              className="p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Last name"
                              value={editedProfile.lastname || ""}
                              onChange={(e) => setEditedProfile({...editedProfile, lastname: e.target.value})}
                              className="p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <User className="text-blue-400" size={20} />
                            <span>{profile.firstname} {profile.lastname}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Mobile Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedProfile.mobile_no || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, mobile_no: e.target.value})}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <Phone className="text-blue-400" size={20} />
                            <span>{profile.mobile_no}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-blue-400" size={20} />
                      <span className="text-gray-400">Member since</span>
                      <span className="text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h3 className="font-semibold mb-2">Change Password</h3>
                      <p className="text-gray-400 text-sm mb-3">Update your password regularly to keep your account secure</p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Change Password
                      </button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                      <p className="text-gray-400 text-sm mb-3">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}