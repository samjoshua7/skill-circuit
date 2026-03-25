import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const CustomerDashboard = ({ user }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-500">You don't have any bookings yet.</p>
        <button className="mt-4 text-blue-600 font-medium hover:underline">Explore Services</button>
      </div>
    </div>
  );
};

const VendorDashboard = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Portal</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">My Services</h3>
          <button
            onClick={() => navigate('/create-service')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Add New Service
          </button>
        </div>
        <p className="text-slate-500">You haven't posted any services yet.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-4">Recent Client Requests</h3>
        <p className="text-slate-500">No requests found.</p>
      </div>
    </div>
  );
};

const AdminDashboard = ({ user }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-indigo-700">Pending Approvals</h3>
          <p className="text-slate-500 text-sm">No vendors pending approval.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-emerald-700">Platform Analytics</h3>
          <p className="text-slate-500 text-sm">System metrics and active bookings will appear here.</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { dbUser } = useAuth();

  if (!dbUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">
          {dbUser.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {dbUser.name}</h1>
          <p className="text-slate-500 font-medium">
            Role: <span className="text-blue-600">{dbUser.role}</span>
            {dbUser.role === 'Vendor' && ` • Rep Score: ${dbUser.reputationScore} ⭐️`}
          </p>
        </div>
      </div>

      {dbUser.role === 'Customer' && <CustomerDashboard user={dbUser} />}
      {dbUser.role === 'Vendor' && <VendorDashboard user={dbUser} />}
      {dbUser.role === 'Admin' && <AdminDashboard user={dbUser} />}
    </div>
  );
};

export default Dashboard;
