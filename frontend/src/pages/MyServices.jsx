import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

const MyServices = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/services/vendor/${dbUser._id}`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { 'x-user-id': dbUser._id }
      });
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete service.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await axios.put(`http://localhost:5000/api/services/${service._id}`,
        { isActive: !service.isActive },
        { headers: { 'x-user-id': dbUser._id } }
      );
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: !s.isActive } : s));
    } catch (err) {
      setError('Failed to update service status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Services 🛠️</h1>
          <p className="text-slate-500 text-sm mt-1">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button
          onClick={() => navigate('/create-service')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow"
        >
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">No services yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create your first service to start accepting orders.</p>
          <button onClick={() => navigate('/create-service')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
            Create Service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-800 text-lg truncate">{service.title}</h3>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{service.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold">{service.category}</span>
                    <span className="font-bold text-slate-700">₹{service.basePrice}</span>
                    <span>📍 {service.location}</span>
                    {service.tags?.map(t => <span key={t} className="bg-slate-50 px-2 py-1 rounded-lg">#{t}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="p-2 rounded-xl hover:bg-slate-50 transition text-slate-400 hover:text-indigo-600"
                    title={service.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {service.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-50 transition text-slate-400 hover:text-blue-600"
                    title="Edit (coming soon)"
                    onClick={() => alert('Edit form coming soon. For now, delete and re-create.')}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    disabled={deletingId === service._id}
                    className="p-2 rounded-xl hover:bg-red-50 transition text-slate-400 hover:text-red-600 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;
