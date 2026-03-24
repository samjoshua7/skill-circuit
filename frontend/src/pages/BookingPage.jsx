import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const service = location.state?.service;
  
  const [price, setPrice] = useState(service?.basePrice || 0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!service) {
    return <div className="text-center py-20 text-slate-500">Service data lost. Please go back.</div>;
  }

  const handleBooking = async () => {
    setConfirming(true);
    try {
      const payload = {
        serviceId: service._id,
        customerId: dbUser._id,
        vendorId: service.createdBy._id,
        price: Number(price),
        status: service.category.toLowerCase() === 'teaching' ? 'booked' : 'requested',
        paymentStatus: 'paid' // Fake wallet flow
      };

      await axios.post('http://localhost:5000/api/bookings', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
      setConfirming(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white max-w-2xl mx-auto rounded-3xl shadow-sm border border-emerald-100">
        <CheckCircle className="w-24 h-24 text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 text-lg">Your booking has been confirmed.</p>
        <p className="text-sm text-slate-400 mt-6">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">Checkout Process</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2 text-slate-700">Service Quote</h3>
              <p className="text-sm text-slate-500 mb-3">You can negotiate or modify the final agreed price before payment.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r pr-2 border-slate-300">₹</span>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
              <h3 className="flex items-center text-lg font-bold mb-4 text-slate-700">
                <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                Skill Circuit Wallet
              </h3>
              <p className="text-sm text-slate-600 mb-4">We will deduct the amount from your simulated wallet balance. Payments are held in escrow until the service is marked completed.</p>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Available Balance:</span>
                <span className="text-emerald-600 font-bold text-lg">₹50000.00</span>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              disabled={confirming}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
            >
              {confirming ? 'Processing...' : `Pay ₹${price} & Book`}
            </button>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b">Order Summary</h3>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Service</p>
              <p className="font-semibold text-slate-800">{service.title}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Provider</p>
              <p className="font-semibold text-slate-800">{service.createdBy?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Category</p>
              <p className="font-semibold text-emerald-600 capitalize">{service.category}</p>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <span className="font-bold text-slate-700">Total</span>
            <span className="text-2xl font-extrabold text-blue-600">₹{price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
