import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dash/dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./pages/auth/forgotPassword";
import HomeCarousel from "./pages/dash/home";
import IntradayChart from "./pages/dash/intraday";
import ProfilePage from "./pages/dash/profile";
import BrokerAccountForm from "./pages/dash/SelectBroker";
import Swing from "./pages/dash/swing";
import LongTerm from "./pages/dash/longTerm";
import { ProfileProvider } from "./context/ProfileContext";
// import longTerm from "@/pages/dash/longTerm";

function PrivateRoute({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />

            {/* Protected Routes (all under Dashboard) */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomeCarousel />} />
              <Route path="intraday" element={<IntradayChart />} />
              <Route path="longterm" element={<LongTerm />} />
              <Route path="swing" element={<Swing />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="broker" element={<BrokerAccountForm />} />
            </Route>

            {/* Catch-all route (optional) */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <ToastContainer />
      </ProfileProvider>
    </AuthProvider>
  );
}
