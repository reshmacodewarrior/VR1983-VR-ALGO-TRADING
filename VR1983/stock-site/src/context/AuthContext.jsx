import React, { createContext, useContext, useState, useEffect } from "react";

const BASE_URL = "http://192.168.1.58:8000/api/user/";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setAuth(true);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ✅ Extract clean error message from backend response
  const getErrorMessage = (data) => {
    console.log("Raw error data:", data);
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
      }
      if (typeof data.detail === 'object') {
        return data.detail.msg || JSON.stringify(data.detail);
      }
    }
    
    if (Array.isArray(data)) {
      return data.map(err => err.msg || JSON.stringify(err)).join(', ');
    }
    
    return JSON.stringify(data).substring(0, 100);
  };

  // ✅ FIXED: Login function using form-data (URL encoded)
  const login = async (emailOrUsername, password) => {
    try {
      console.log("Login attempt:", { emailOrUsername });
      
      // Use URLSearchParams for form data
      const formData = new URLSearchParams();
      formData.append('username', emailOrUsername); // OAuth2PasswordRequestForm expects 'username' field
      formData.append('password', password);

      const response = await fetch(`${BASE_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        const token = data.access_token;
        const userData = data.user;
        
        localStorage.setItem("token", token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        setAuth(true);
        setUsername(userData.username);
        
        console.log("Login successful");
        return { success: true, user: userData };
      } else {
        const errorMessage = getErrorMessage(data);
        console.error("Login failed:", errorMessage);
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: "Network error. Please check your connection." 
      };
    }
  };

  // ✅ Register function (keep as JSON since your signup endpoint uses JSON)
  const register = async (username, firstname, lastname, email, mobile_no, password) => {
    try {
      console.log("Registration attempt:", { username, email, mobile_no });
      
      const response = await fetch(`${BASE_URL}signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email.trim().toLowerCase(),
          mobile_no: mobile_no ? mobile_no.trim() : null,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        console.log("Registration successful");
        return { 
          success: true, 
          message: data.message || "Registration successful! Please login." 
        };
      } else {
        const errorMessage = getErrorMessage(data);
        console.error("Registration failed:", errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  };

  // ✅ Get current user profile
  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`${BASE_URL}profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // ✅ Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await fetch(`${BASE_URL}refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return false;
    }
  };

  // ✅ Enhanced Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        await fetch(`${BASE_URL}logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: localStorage.getItem("refresh_token"),
          }),
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      setAuth(false);
      setUsername('');
    }
  };

  // ✅ Check if user is authenticated
  const isAuthenticated = () => {
    return auth && user !== null;
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        auth, 
        username,
        isLoading,
        login, 
        register, 
        logout, 
        getProfile,
        refreshToken,
        isAuthenticated,
        setAuth, 
        setUsername 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};