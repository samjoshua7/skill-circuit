import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, ChevronDown, Loader } from 'lucide-react';

const STATUS_FLOW = ['requested', 'received', 'repairing', 'completed', 'delivered'];
const STATUS_COLORS = {
  requested:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  received:   'bg-blue-50 text-blue-700 border-blue-200',
  repairing:  'bg-orange-50 text-orange-700 border-orange-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  delivered:  'bg-teal-50 text-teal-700 border-teal-200',
  booked:     'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
};

const IncomingOrders = () => {
  const { dbUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/vendor/${dbUser._id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await axios.put(`http://localhost:5000/api/bookings/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Incoming Orders 📦</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUS_FLOW].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No orders yet</h3>
          <p className="text-slate-400 text-sm">When customers book your services, orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const colorClass = STATUS_COLORS[order.status] || 'bg-slate-50 text-slate-600 border-slate-200';
            const isUpdating = updating === order._id;

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{order.serviceId?.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Customer: <strong>{order.customerId?.name}</strong> · {order.customerId?.email}
                    </p>
                    <p className="text-sm text-slate-500">Category: {order.serviceId?.category}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">₹{order.price}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`border px-3 py-1 rounded-full text-xs font-bold capitalize ${colorClass}`}>
                      {order.status}
                    </span>

                    {/* Status Dropdown */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="relative">
                        <select
                          disabled={isUpdating}
                          value={order.status}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8 cursor-pointer"
                        >
                          {STATUS_FLOW.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                          {isUpdating ? <Loader className="w-4 h-4 animate-spin text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncomingOrders;
