import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServicesList from './pages/ServicesList';
import ServiceDetails from './pages/ServiceDetails';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/book/:id" element={<BookingPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
