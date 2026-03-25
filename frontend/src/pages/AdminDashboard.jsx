import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Users, ShoppingBag, Star, BarChart2,
  ChevronDown, Loader, Trash2, RefreshCw
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';

// Axios helper that injects x-user-id header
const adminAxios = (userId) => ({
  headers: { 'x-user-id': userId }
});

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-extrabold text-slate-800">{value ?? '—'}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

// ── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  requested: 'bg-yellow-50 text-yellow-700',
  received:  'bg-blue-50 text-blue-700',
  repairing: 'bg-orange-50 text-orange-700',
  completed: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-teal-50 text-teal-700',
  booked:    'bg-indigo-50 text-indigo-700',
  cancelled: 'bg-red-50 text-red-600',
};
const PAY_COLORS = {
  pending: 'bg-slate-100 text-slate-600',
  paid:    'bg-emerald-50 text-emerald-700',
  refunded:'bg-red-50 text-red-600',
};

const STATUS_FLOW = ['requested','received','repairing','completed','delivered','cancelled'];
const PAY_FLOW   = ['pending','paid','refunded'];

// ── Section Tabs ─────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Users', 'Bookings', 'Services', 'Reviews'];

// ════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { dbUser } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [updating, setUpdating] = useState(null);

  const cfg = adminAxios(dbUser._id);

  const fetchStats = async () => {
    const res = await axios.get(`${API}/stats`, cfg);
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`, cfg);
    setUsers(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get(`${API}/bookings`, cfg);
    setBookings(res.data);
  };

  const fetchServices = async () => {
    const res = await axios.get(`${API}/services`, cfg);
    setServices(res.data);
  };

  const fetchReviews = async () => {
    const res = await axios.get(`${API}/reviews`, cfg);
    setReviews(res.data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 'Overview') await fetchStats();
        if (tab === 'Users')    await fetchUsers();
        if (tab === 'Bookings') await fetchBookings();
        if (tab === 'Services') await fetchServices();
        if (tab === 'Reviews')  await fetchReviews();
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [tab]);

  const updateBooking = async (id, field, value) => {
    setUpdating(id + field);
    try {
      const payload = field === 'status' ? { status: value } : { paymentStatus: value };
      const res = await axios.put(`${API}/bookings/${id}`, payload, cfg);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, ...res.data } : b));
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await axios.delete(`${API}/services/${id}`, cfg);
    setServices(prev => prev.filter(s => s._id !== id));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-3xl font-extrabold text-slate-800">Admin Control Panel</h1>
          </div>
          <p className="text-slate-500 text-sm">Full platform oversight · logged in as <strong>{dbUser?.email}</strong></p>
        </div>
        <button
          onClick={() => { setStats(null); setLoading(true); fetchStats().finally(() => setLoading(false)); }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 border border-slate-200 px-4 py-2 rounded-xl hover:border-blue-300 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 pb-px overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition whitespace-nowrap border-b-2 ${tab === t ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400 gap-3">
          <Loader className="w-6 h-6 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {tab === 'Overview' && stats && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users"    value={stats.totalUsers}    icon={<Users className="w-6 h-6 text-blue-600" />}    color="bg-blue-50" />
                <StatCard label="Customers"      value={stats.customers}      icon={<Users className="w-6 h-6 text-sky-600" />}      color="bg-sky-50" />
                <StatCard label="Vendors"        value={stats.vendors}        icon={<Users className="w-6 h-6 text-indigo-600" />}   color="bg-indigo-50" />
                <StatCard label="Total Bookings" value={stats.totalBookings}  icon={<ShoppingBag className="w-6 h-6 text-orange-500" />} color="bg-orange-50" />
                <StatCard label="Paid Bookings"  value={stats.paid}           icon={<BarChart2 className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50" />
                <StatCard label="Completed"      value={stats.completed}      icon={<BarChart2 className="w-6 h-6 text-teal-600" />} color="bg-teal-50" />
                <StatCard label="Total Services" value={stats.totalServices}  icon={<ShoppingBag className="w-6 h-6 text-purple-600" />} color="bg-purple-50" />
                <StatCard label="Total Reviews"  value={stats.totalReviews}   icon={<Star className="w-6 h-6 text-amber-500" />}     color="bg-amber-50" />
              </div>
            </div>
          )}

          {/* ── USERS ────────────────────────────────────────────────────── */}
          {tab === 'Users' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Wallet</th>
                    <th className="px-6 py-4">Rep Score</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'Admin' ? 'bg-red-100 text-red-700' : u.role === 'Vendor' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">₹{u.walletBalance ?? 0}</td>
                      <td className="px-6 py-4">{u.reputationScore > 0 ? `⭐ ${u.reputationScore}` : '—'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center py-12 text-slate-400">No users found.</p>}
            </div>
          )}

          {/* ── BOOKINGS ─────────────────────────────────────────────────── */}
          {tab === 'Bookings' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">{b.serviceId?.title}</td>
                      <td className="px-6 py-4 text-slate-500">{b.customerId?.name}</td>
                      <td className="px-6 py-4 text-slate-500">{b.vendorId?.name}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">₹{b.price}</td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center gap-1">
                          <select
                            value={b.status}
                            disabled={updating === b._id + 'status'}
                            onChange={e => updateBooking(b._id, 'status', e.target.value)}
                            className={`appearance-none text-xs font-bold px-2 py-1 rounded-full cursor-pointer border-0 outline-none ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {STATUS_FLOW.map(s => <option key={s} value={s} className="bg-white text-slate-800">{s}</option>)}
                          </select>
                          {updating === b._id + 'status' && <Loader className="w-3 h-3 animate-spin text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center gap-1">
                          <select
                            value={b.paymentStatus}
                            disabled={updating === b._id + 'paymentStatus'}
                            onChange={e => updateBooking(b._id, 'paymentStatus', e.target.value)}
                            className={`appearance-none text-xs font-bold px-2 py-1 rounded-full cursor-pointer border-0 outline-none ${PAY_COLORS[b.paymentStatus] || 'bg-slate-100'}`}
                          >
                            {PAY_FLOW.map(s => <option key={s} value={s} className="bg-white text-slate-800">{s}</option>)}
                          </select>
                          {updating === b._id + 'paymentStatus' && <Loader className="w-3 h-3 animate-spin text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="text-center py-12 text-slate-400">No bookings.</p>}
            </div>
          )}

          {/* ── SERVICES ─────────────────────────────────────────────────── */}
          {tab === 'Services' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Active</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {services.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">{s.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{s.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{s.createdBy?.name}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">₹{s.basePrice}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {s.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => deleteService(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && <p className="text-center py-12 text-slate-400">No services.</p>}
            </div>
          )}

          {/* ── REVIEWS ──────────────────────────────────────────────────── */}
          {tab === 'Reviews' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Comment</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reviews.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-xs">{r.serviceId?.title}</td>
                      <td className="px-6 py-4 text-slate-500">{r.customerId?.name}</td>
                      <td className="px-6 py-4 text-slate-500">{r.vendorId?.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-yellow-500 font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate italic">{r.comment || '—'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reviews.length === 0 && <p className="text-center py-12 text-slate-400">No reviews.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
