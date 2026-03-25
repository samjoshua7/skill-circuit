import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Star, ChevronDown, MessageSquare } from 'lucide-react';

const STATUS_COLORS = {
  requested:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  received:   'bg-blue-50 text-blue-700 border-blue-200',
  repairing:  'bg-orange-50 text-orange-700 border-orange-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  delivered:  'bg-teal-50 text-teal-700 border-teal-200',
  booked:     'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
};

const ReviewForm = ({ booking, onDone }) => {
  const { dbUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        serviceId: booking.serviceId?._id,
        vendorId: booking.vendorId?._id,
        customerId: dbUser._id,
        bookingId: booking._id,
        rating,
        comment
      });
      setDone(true);
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <p className="text-emerald-600 text-sm font-medium mt-3">✅ Review submitted!</p>;

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <p className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-1">
        <MessageSquare className="w-4 h-4" /> Leave a Review
      </p>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setRating(n)}>
            <Star className={`w-6 h-6 transition ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={2}
        placeholder="Share your experience..."
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

const MyBookings = () => {
  const { dbUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReview, setOpenReview] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/customer/${dbUser._id}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-6">My Bookings 📋</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No bookings yet</h3>
          <p className="text-slate-400 text-sm">Head to the Marketplace to book a service!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const colorClass = STATUS_COLORS[b.status] || STATUS_COLORS.requested;
            const isCompleted = b.status === 'completed';
            const showReviewForm = openReview === b._id;

            return (
              <div key={b._id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{b.serviceId?.title || 'Service'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Provider: <strong>{b.vendorId?.name}</strong></p>
                    <p className="text-sm text-slate-500">Category: {b.serviceId?.category}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Paid: <span className="text-blue-600 font-bold">₹{b.price}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`border px-3 py-1 rounded-full text-xs font-bold capitalize ${colorClass}`}>
                      {b.status}
                    </span>
                    {b.paymentStatus === 'paid' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle className="w-3 h-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>

                {isCompleted && (
                  <button
                    onClick={() => setOpenReview(showReviewForm ? null : b._id)}
                    className="mt-4 flex items-center gap-1 text-sm text-amber-600 font-semibold hover:underline"
                  >
                    <Star className="w-4 h-4" />
                    {showReviewForm ? 'Cancel' : 'Leave a Review'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showReviewForm ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {showReviewForm && (
                  <ReviewForm booking={b} onDone={() => { setOpenReview(null); fetchBookings(); }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
