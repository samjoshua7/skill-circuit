import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
      } catch (err) {
        console.error('Error fetching services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading services...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Available Services</h1>
        <div className="flex space-x-2">
          {['All', 'Repair', 'Teaching', 'Freelance'].map(cat => (
            <button key={cat} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-100 shadow-sm text-slate-500">
          No services available yet. Be the first vendor to post one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white border text-left border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {service.category}
                </span>
                <span className="font-extrabold text-slate-800 text-xl">₹{service.basePrice}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition">
                {service.title}
              </h3>
              <p className="text-slate-500 line-clamp-2 mb-4 text-sm">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold mr-2">
                    {service.createdBy?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 truncate w-24">{service.createdBy?.name}</p>
                    <div className="flex items-center text-yellow-500 text-xs font-medium">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {service.createdBy?.reputationScore || 'New'}
                    </div>
                  </div>
                </div>
                <Link to={`/services/${service._id}`} className="bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
