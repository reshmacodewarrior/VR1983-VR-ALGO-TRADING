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
import Holdings from './pages/dash/Holdings'; // Adjust path as needed

// In your routes configuration

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
              <Route path="/holdings" element={<Holdings />} />
              <Route path="livemarket" element={<LiveMarket />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="broker" element={<BrokerAccountForm />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        
        {/* Light Blue Theme Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            backgroundColor: '#e0f2fe', // light blue background
            color: '#075985', // dark blue text
            border: '1px solid #7dd3fc', // blue border
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
            fontFamily: 'Poppins, sans-serif'
          }}
          progressStyle={{
            background: 'linear-gradient(to right, #0ea5e9, #38bdf8)', // blue gradient
            height: '3px'
          }}
          style={{
            zIndex: 9999
          }}
        />
      </ProfileProvider>
    </AuthProvider>
  );
}