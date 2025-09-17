import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Badge, Edit3, CreditCard, BarChart3, Settings, LogOut, Shield, Globe, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const { setUsername, logout } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = () => {
    fetch("http://192.168.1.58:8000/api/user/profile", {
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

  const handleSave = () => {
    // Simulate save operation
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    // In a real app, you would send the updated data to your backend
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
  };

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-blue-200">Manage your account settings and preferences</p>
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
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-4 border-gray-900">
                    <Edit3 size={12} className="text-gray-900" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center">{profile.username}</h2>
                <p className="text-blue-300 text-sm">Premium Member</p>
              </div>

              <nav className="space-y-2">
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
                  onClick={() => setActiveTab("stats")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "stats" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>Trading Statistics</span>
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
                  onClick={() => setActiveTab("billing")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "billing" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <CreditCard size={20} />
                  <span>Billing</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "settings" 
                    ? "bg-blue-600/30 text-white border border-blue-500/50" 
                    : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
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

            {/* Status Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-5 mt-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Award className="text-green-400" size={24} />
                <h3 className="font-semibold">Account Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Verification</span>
                  <span className="text-green-400 font-medium">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Member since</span>
                  <span className="text-gray-300">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tier</span>
                  <span className="text-yellow-400 font-medium">Gold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white">
              {/* Profile Header */}
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

              {/* Profile Information */}
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

              {/* Join Date */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-400" size={20} />
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-400/30">
                  <div className="text-blue-300 text-sm">Total Trades</div>
                  <div className="text-2xl font-bold text-white">247</div>
                  <div className="text-green-400 text-xs">+12% this month</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-xl border border-green-400/30">
                  <div className="text-green-300 text-sm">Success Rate</div>
                  <div className="text-2xl font-bold text-white">78%</div>
                  <div className="text-green-400 text-xs">+5% this month</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-xl border border-purple-400/30">
                  <div className="text-purple-300 text-sm">Portfolio Value</div>
                  <div className="text-2xl font-bold text-white">$24,589</div>
                  <div className="text-green-400 text-xs">+8.2% this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}