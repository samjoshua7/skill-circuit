import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} className={`w-4 h-4 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
    ))}
  </div>
);

const VendorReviews = () => {
  const { dbUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/vendor/${dbUser._id}`);
        setReviews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">My Reviews ⭐</h1>
        {avg && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl font-black text-amber-500">{avg}</span>
            <div>
              <StarDisplay rating={Math.round(avg)} />
              <p className="text-xs text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No reviews yet</h3>
          <p className="text-slate-400 text-sm">Complete orders to receive reviews from customers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-slate-800">{r.customerId?.name || 'Anonymous'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">For: {r.serviceId?.title}</p>
                </div>
                <div className="text-right">
                  <StarDisplay rating={r.rating} />
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mt-1 italic">"{r.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
