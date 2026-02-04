import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

import { Suspense, lazy } from "react";
// Pages (to be created)
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const HomePage = lazy(() => import("./pages/customer/HomePage"));
const CartPage = lazy(() => import("./pages/customer/CartPage"));
const PaymentPage = lazy(() => import("./pages/customer/PaymentPage"));

const BillPage = lazy(() => import("./pages/customer/BillPage"));
const OrdersPage = lazy(() => import("./pages/customer/OrdersPage"));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage"));


const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ItemsPage = lazy(() => import("./pages/admin/ItemsPage"));
const LocationTimeslotPage = lazy(() => import("./pages/admin/LocationTimeslotPage"));
const SettlementsPage = lazy(() => import("./pages/admin/SettlementsPage"));

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
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
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
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
