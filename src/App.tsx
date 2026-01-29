import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Pages (to be created)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/customer/HomePage";
import CartPage from "./pages/customer/CartPage";
import PaymentPage from "./pages/customer/PaymentPage";

import BillPage from "./pages/customer/BillPage";
import OrdersPage from "./pages/customer/OrdersPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";


import AdminDashboard from "./pages/admin/Dashboard";
import ItemsPage from "./pages/admin/ItemsPage";
import LocationTimeslotPage from "./pages/admin/LocationTimeslotPage";
import SettlementsPage from "./pages/admin/SettlementsPage";

import CustomerLayout from "./components/CustomerLayout";
import AdminLayout from "./components/AdminLayout";

import React from "react";



function ProtectedRoute({ children, role }: { children: React.ReactElement; role?: "admin" | "customer" }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.verification.getCurrentUser);

  if (isLoading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" />;
  }

  // Force name entry if missing
  if (!user.name && window.location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />; // Or forbidden page
  }
  return children;
}


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />


          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/home" element={<ProtectedRoute role="customer"><HomePage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute role="customer"><CartPage /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute role="customer"><PaymentPage /></ProtectedRoute>} />
            <Route path="/bill/:orderId" element={<ProtectedRoute role="customer"><BillPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute role="customer"><OrdersPage /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/items" element={<ProtectedRoute role="admin"><ItemsPage /></ProtectedRoute>} />
            <Route path="/admin/locations" element={<ProtectedRoute role="admin"><LocationTimeslotPage /></ProtectedRoute>} />
            <Route path="/admin/settlements" element={<ProtectedRoute role="admin"><SettlementsPage /></ProtectedRoute>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
