import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Badge, Edit3, BarChart3, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [activeTab, setActiveTab] = useState("profile"); // Default to profile tab
  const { logout } = useAuth();

  // Primary color for the theme
  const primaryColor = "#42a5f5";

  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  useEffect(() => {
    fetchProfileData();
  }, []);

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

  const handleSave = () => {
    // Add your save logic here
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mb-4"
            style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
          ></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>My Account</h1>
          <p className="text-gray-600">Manage your profile and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div 
              className="bg-white border rounded-2xl p-6 shadow-lg"
              style={{ borderColor: `${primaryColor}20` }}
            >
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #9333ea)` }}
                  >
                    <User size={48} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-900">{profile.username}</h2>
                <p className="text-sm" style={{ color: primaryColor }}>{profile.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "profile" 
                    ? "text-white border" 
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: activeTab === "profile" ? primaryColor : 'transparent',
                    borderColor: activeTab === "profile" ? primaryColor : 'transparent'
                  }}
                >
                  <User size={20} />
                  <span>Profile Information</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === "security" 
                    ? "text-white border" 
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: activeTab === "security" ? primaryColor : 'transparent',
                    borderColor: activeTab === "security" ? primaryColor : 'transparent'
                  }}
                >
                  <Shield size={20} />
                  <span>Security</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>

            {/* Profile Stats Card */}
            <div 
              className="border rounded-2xl p-5 mt-6 shadow-lg"
              style={{ 
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}20`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 style={{ color: primaryColor }} size={24} />
                <h3 className="font-semibold" style={{ color: primaryColor }}>Profile Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div 
              className="bg-white border rounded-2xl p-6 shadow-lg"
              style={{ borderColor: `${primaryColor}20` }}
            >
              
              {activeTab === "profile" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-white hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1e88e5';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = primaryColor;
                        }}
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl transition-all text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-all text-white"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Username</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.username || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                            className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors"
                            style={{
                              borderColor: `${primaryColor}40`,
                              focusRingColor: primaryColor
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                            <Badge style={{ color: primaryColor }} size={20} />
                            <span className="text-gray-900">{profile.username}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedProfile.email || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                            className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors"
                            style={{
                              borderColor: `${primaryColor}40`,
                              focusRingColor: primaryColor
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                            <Mail style={{ color: primaryColor }} size={20} />
                            <span className="text-gray-900">{profile.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Full Name</label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="First name"
                              value={editedProfile.firstname || ""}
                              onChange={(e) => setEditedProfile({...editedProfile, firstname: e.target.value})}
                              className="p-3 border rounded-xl focus:ring-2 outline-none transition-colors"
                              style={{
                                borderColor: `${primaryColor}40`,
                                focusRingColor: primaryColor
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Last name"
                              value={editedProfile.lastname || ""}
                              onChange={(e) => setEditedProfile({...editedProfile, lastname: e.target.value})}
                              className="p-3 border rounded-xl focus:ring-2 outline-none transition-colors"
                              style={{
                                borderColor: `${primaryColor}40`,
                                focusRingColor: primaryColor
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                            <User style={{ color: primaryColor }} size={20} />
                            <span className="text-gray-900">{profile.firstname} {profile.lastname}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Mobile Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedProfile.mobile_no || ""}
                            onChange={(e) => setEditedProfile({...editedProfile, mobile_no: e.target.value})}
                            className="w-full p-3 border rounded-xl focus:ring-2 outline-none transition-colors"
                            style={{
                              borderColor: `${primaryColor}40`,
                              focusRingColor: primaryColor
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                            <Phone style={{ color: primaryColor }} size={20} />
                            <span className="text-gray-900">{profile.mobile_no}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t" style={{ borderColor: `${primaryColor}20` }}>
                    <div className="flex items-center gap-3">
                      <Calendar style={{ color: primaryColor }} size={20} />
                      <span className="text-gray-600">Member since</span>
                      <span className="text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                      <h3 className="font-semibold mb-2 text-gray-900">Change Password</h3>
                      <p className="text-gray-600 text-sm mb-3">Update your password regularly to keep your account secure</p>
                      <button 
                        className="px-4 py-2 rounded-lg transition-colors text-white hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1e88e5';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = primaryColor;
                        }}
                      >
                        Change Password
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-xl border" style={{ borderColor: `${primaryColor}20` }}>
                      <h3 className="font-semibold mb-2 text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-gray-600 text-sm mb-3">Add an extra layer of security to your account</p>
                      <button 
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white hover:scale-105"
                      >
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