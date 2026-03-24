import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldCheck, Clock, MapPin, CheckCircle } from 'lucide-react';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        const found = res.data.find(s => s._id === id);
        setService(found);
      } catch (err) {
        console.error('Error fetching service details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading details...</div>;
  if (!service) return <div className="text-center py-20 text-red-500">Service not found!</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm mb-4">
                {service.category.toUpperCase()}
              </span>
              <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">{service.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-slate-700">{service.createdBy?.reputationScore || 'New Vendor'}</span>
                </div>
                <div className="flex items-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-500 mr-1" />
                   Verified Vendor
                </div>
                <div className="flex items-center">
                   <MapPin className="w-5 h-5 text-blue-500 mr-1" />
                   Tirunelveli
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Starting at</p>
              <p className="text-4xl font-extrabold text-slate-800">₹{service.basePrice}</p>
            </div>
          </div>
          
          <div className="mb-10">
            <h3 className="text-xl font-bold text-slate-800 mb-4">About This Service</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex justify-center items-center text-2xl font-bold font-serif">
                {service.createdBy?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">{service.createdBy?.name}</p>
                <p className="text-sm text-slate-500">Service Provider</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (!dbUser) {
                  navigate('/login', { state: { from: `/services/${id}` } });
                } else {
                  navigate(`/book/${id}`, { state: { service } });
                }
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
            >
              Continue to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
