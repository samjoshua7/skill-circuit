import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';

// Existing pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServicesList from './pages/ServicesList';
import ServiceDetails from './pages/ServiceDetails';
import BookingPage from './pages/BookingPage';
import CreateServicePage from './pages/CreateServicePage';

// New pages
import Marketplace from './pages/Marketplace';
import VendorDashboard from './pages/VendorDashboard';
import MyBookings from './pages/MyBookings';
import MyServices from './pages/MyServices';
import IncomingOrders from './pages/IncomingOrders';
import VendorReviews from './pages/VendorReviews';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/AdminDashboard';

// ── Role helpers ─────────────────────────────────────────────────────────────
const roleHome = (role) => {
  if (role === 'Admin') return '/admin-dashboard';
  if (role === 'Vendor') return '/vendor-dashboard';
  return '/marketplace';
};

// ── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { dbUser } = useAuth();
  if (!dbUser) return <Navigate to="/login" replace />;
  if (role && dbUser.role !== role) {
    return <Navigate to={roleHome(dbUser.role)} replace />;
  }
  return children;
};

// ── Shell: decides whether to show sidebar ───────────────────────────────────
function AppShell() {
  const { dbUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Public pages (no sidebar): /, /login, /services, /services/:id
  const showSidebar = !!dbUser;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top navbar (always visible) */}
      <Navbar onMenuToggle={() => setMobileOpen(o => !o)} />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — only when logged in */}
        {showSidebar && (
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Customer-only */}
              <Route path="/marketplace" element={<ProtectedRoute role="Customer"><Marketplace /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute role="Customer"><MyBookings /></ProtectedRoute>} />

              {/* Admin-only */}
              <Route path="/admin-dashboard" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />

              {/* Vendor-only */}
              <Route path="/vendor-dashboard"  element={<ProtectedRoute role="Vendor"><VendorDashboard /></ProtectedRoute>} />
              <Route path="/my-services"        element={<ProtectedRoute role="Vendor"><MyServices /></ProtectedRoute>} />
              <Route path="/incoming-orders"    element={<ProtectedRoute role="Vendor"><IncomingOrders /></ProtectedRoute>} />
              <Route path="/vendor-reviews"     element={<ProtectedRoute role="Vendor"><VendorReviews /></ProtectedRoute>} />
              <Route path="/create-service"     element={<ProtectedRoute role="Vendor"><CreateServicePage /></ProtectedRoute>} />

              {/* Shared (any logged-in user) */}
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute role="Customer"><BookingPage /></ProtectedRoute>} />

              {/* Legacy compatibility */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/services"    element={<ServicesList />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
