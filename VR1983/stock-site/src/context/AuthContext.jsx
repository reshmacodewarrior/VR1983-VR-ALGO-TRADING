import React, { createContext, useContext, useState } from "react";

const BASE_URL = "http://192.168.1.58:8000/api/user/";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState('')

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}login`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();
      // console.log("🔑 Access Token:", data.access_token);
      const token = data.access_token;
      localStorage.setItem("token", token);
      // console.log("token-type", data.token_type);
      if (response.ok) {
        setUser(data.user);
        console.log("success");
        setAuth(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // ✅ Register function
  const register = async (
    username,
    firstname,
    lastname,
    email,
    mobile_no,
    password
  ) => {
    try {
      const response = await fetch(`${BASE_URL}signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          firstname,
          lastname,
          email,
          mobile_no,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("success");

        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.detail || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    setAuth(false)
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, auth, setAuth, setUsername, username }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
