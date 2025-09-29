import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dash/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import HomeCarousel from "./pages/dash/Home";
import LiveMarket from "./pages/dash/Livemarket";
import ProfilePage from "./pages/dash/Profile";
import OrdersPage from "./pages/dash/OrdersPage"; 
import BrokerAccountForm from "./pages/dash/SelectBroker";
import { ProfileProvider } from "./context/ProfileContext";

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
              <Route path="livemarket" element={<LiveMarket />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="broker" element={<BrokerAccountForm />} />
              <Route path="orders" element={<OrdersPage />} /> {/* Add this route */}

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