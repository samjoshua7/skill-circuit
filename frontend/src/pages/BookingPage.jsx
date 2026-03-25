import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Shield, X, CreditCard, Smartphone, Building2, Wifi } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { dbUser, updateDbUser } = useAuth();
  const service = location.state?.service;

  const [price] = useState(service?.basePrice || 0);
  const [showModal, setShowModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!service) {
    return (
      <div className="text-center py-20 text-slate-500">
        Service data lost. <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go back</button>
      </div>
    );
  }

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      if ((dbUser?.walletBalance ?? 0) < price) {
        setError('Insufficient wallet balance.');
        setPaying(false);
        return;
      }
      const res = await axios.post('http://localhost:5000/api/bookings', {
        serviceId: service._id,
        customerId: dbUser._id,
        vendorId: service.createdBy._id,
        price,
        status: 'requested',
        paymentStatus: 'paid'
      });
      // Sync wallet balance locally
      updateDbUser({ walletBalance: res.data.walletBalance });
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Try again.');
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 text-lg mb-1">Your booking for <strong>{service.title}</strong> is confirmed.</p>
        <p className="text-sm text-slate-400 mt-6">Redirecting to My Bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="md:col-span-2">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Booking Summary</h2>
          <p className="text-slate-500 text-sm mb-6">Review your order before proceeding to payment</p>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Service</span>
              <span className="font-semibold text-slate-800">{service.title}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Provider</span>
              <span className="font-semibold text-slate-800">{service.createdBy?.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Category</span>
              <span className="font-semibold text-emerald-600 capitalize">{service.category}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-600">Your Wallet Balance</span>
              <span className={`font-bold text-lg ${(dbUser?.walletBalance ?? 0) >= price ? 'text-emerald-600' : 'text-red-600'}`}>
                ₹{dbUser?.walletBalance ?? 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Proceed to Pay ₹{price}
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b">Order Total</h3>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Base Price</span>
              <span>₹{price}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee</span>
              <span className="text-emerald-600">Free</span>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <span className="font-bold text-slate-700">Total</span>
            <span className="text-2xl font-extrabold text-blue-600">₹{price}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-500" />
            Payments held in escrow until completion
          </div>
        </div>
      </div>

      {/* ===== RAZORPAY-STYLE PAYMENT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Skill Circuit Pay</p>
                <p className="text-white font-extrabold text-2xl">₹{price}</p>
                <p className="text-blue-200 text-xs mt-1">{service.title} • {service.createdBy?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Payment Options (disabled / blurred) */}
            <div className="p-5 space-y-3 relative">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Method</p>

              {/* Options — visually present but disabled */}
              <div className="opacity-40 pointer-events-none space-y-2">
                <div className="flex items-center gap-3 border-2 border-slate-200 rounded-xl p-3 cursor-not-allowed">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm text-slate-700">UPI</p>
                    <p className="text-xs text-slate-400">GPay, PhonePe, PayTM...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-2 border-slate-200 rounded-xl p-3 cursor-not-allowed">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-sm text-slate-700">Credit / Debit Card</p>
                    <p className="text-xs text-slate-400">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-2 border-slate-200 rounded-xl p-3 cursor-not-allowed">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm text-slate-700">Net Banking</p>
                    <p className="text-xs text-slate-400">All major banks supported</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-2 border-slate-200 rounded-xl p-3 cursor-not-allowed">
                  <Wifi className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm text-slate-700">Skill Circuit Wallet</p>
                    <p className="text-xs text-slate-400">Balance: ₹{dbUser?.walletBalance ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 my-3">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs text-slate-400 font-medium">Pay via Platform Wallet</span>
                <hr className="flex-1 border-slate-200" />
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              {/* The ONE active button */}
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-base py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  `💸 Pay ₹${price} from Wallet`
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                Secured by Skill Circuit · Funds released after completion
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
