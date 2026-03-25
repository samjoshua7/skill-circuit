import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ClipboardList, Star, Wallet, Plus, TrendingUp } from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const VendorDashboard = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ services: 0, orders: 0, avgRating: 0, wallet: dbUser?.walletBalance ?? 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [svcRes, ordersRes, reviewsRes, walletRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/services/vendor/${dbUser._id}`),
          axios.get(`http://localhost:5000/api/bookings/vendor/${dbUser._id}`),
          axios.get(`http://localhost:5000/api/reviews/vendor/${dbUser._id}`),
          axios.get(`http://localhost:5000/api/wallet/${dbUser._id}`)
        ]);
        const reviews = reviewsRes.data;
        const avg = reviews.length > 0
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          : 0;
        setStats({
          services: svcRes.data.length,
          orders: ordersRes.data.filter(o => o.status === 'requested').length,
          avgRating: avg,
          wallet: walletRes.data.walletBalance
        });
        setRecentOrders(ordersRes.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const STATUS_COLORS = {
    requested: 'bg-yellow-50 text-yellow-700',
    received: 'bg-blue-50 text-blue-700',
    repairing: 'bg-orange-50 text-orange-700',
    completed: 'bg-emerald-50 text-emerald-700',
    delivered: 'bg-teal-50 text-teal-700',
    booked: 'bg-indigo-50 text-indigo-700',
    cancelled: 'bg-red-50 text-red-600',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Welcome back, {dbUser?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Vendor Dashboard · {dbUser?.email}</p>
        </div>
        <button
          onClick={() => navigate('/create-service')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow"
        >
          <Plus className="w-5 h-5" /> Add New Service
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Briefcase className="w-6 h-6 text-indigo-600" />} label="My Services" value={loading ? '—' : stats.services} color="bg-indigo-50" />
        <StatCard icon={<ClipboardList className="w-6 h-6 text-yellow-600" />} label="Pending Orders" value={loading ? '—' : stats.orders} color="bg-yellow-50" />
        <StatCard icon={<Star className="w-6 h-6 text-amber-500" />} label="Avg Rating" value={loading ? '—' : stats.avgRating || 'New'} color="bg-amber-50" />
        <StatCard icon={<Wallet className="w-6 h-6 text-emerald-600" />} label="Wallet Balance" value={loading ? '—' : `₹${stats.wallet}`} color="bg-emerald-50" />
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Services', path: '/my-services', icon: <Briefcase className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-700' },
          { label: 'Incoming Orders', path: '/incoming-orders', icon: <ClipboardList className="w-6 h-6" />, color: 'from-yellow-500 to-orange-500' },
          { label: 'Reviews', path: '/vendor-reviews', icon: <Star className="w-6 h-6" />, color: 'from-amber-400 to-yellow-500' },
          { label: 'Wallet', path: '/wallet', icon: <Wallet className="w-6 h-6" />, color: 'from-emerald-500 to-teal-600' },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-5 flex flex-col items-center gap-2 hover:opacity-90 transition shadow`}
          >
            {item.icon}
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Orders</h2>
          <button onClick={() => navigate('/incoming-orders')} className="text-sm text-indigo-600 hover:underline font-medium">View all</button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="text-sm">No orders yet. Share your services!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {recentOrders.map(order => (
              <li key={order._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{order.serviceId?.title}</p>
                  <p className="text-xs text-slate-400">{order.customerId?.name} · ₹{order.price}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                  {order.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
