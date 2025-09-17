// ProfileContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

const API_BASE_URL = "http://192.168.1.58:8000"; // adjust your base URL

// 1️⃣ Create Context
export const ProfileContext = createContext();

// 2️⃣ Create Provider
export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch function
  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      console.log("Profile Data:", data);

      setProfiles(data); // store profile data in context state
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <ProfileContext.Provider value={{ profiles, setProfiles, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);