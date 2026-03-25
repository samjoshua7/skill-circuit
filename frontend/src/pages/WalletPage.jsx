import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const WalletPage = () => {
  const { dbUser, updateDbUser } = useAuth();
  const [walletBalance, setWalletBalance] = useState(dbUser?.walletBalance ?? 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isVendor = dbUser?.role === 'Vendor';

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/wallet/${dbUser._id}`),
        axios.get(`http://localhost:5000/api/wallet/${dbUser._id}/transactions`)
      ]);
      setWalletBalance(balRes.data.walletBalance);
      updateDbUser({ walletBalance: balRes.data.walletBalance });
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const totalIn  = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">My Wallet 💰</h1>
        <button onClick={fetchWallet} className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Balance Card */}
      <div className={`rounded-2xl p-8 mb-8 text-white shadow-xl ${isVendor ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-blue-600 to-cyan-600'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-8 h-8 text-white/80" />
          <p className="text-white/80 font-medium">Available Balance</p>
        </div>
        <p className="text-5xl font-black tracking-tight">₹{walletBalance.toLocaleString('en-IN')}</p>
        <p className="text-white/60 text-sm mt-3">Skill Circuit {isVendor ? 'Vendor' : 'Customer'} Wallet</p>

        <div className="flex gap-6 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
              {isVendor ? 'Total Earned' : 'Total Spent'}
            </p>
            <p className="text-white font-bold text-lg">
              ₹{isVendor ? totalIn.toLocaleString('en-IN') : totalOut.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Transactions</p>
            <p className="text-white font-bold text-lg">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No transactions yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {transactions.map((t, i) => (
              <li key={t._id || i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {t.type === 'credit'
                      ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                      : <TrendingDown className="w-5 h-5 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{t.label}</p>
                    <p className="text-xs text-slate-400">
                      {t.vendor && `Vendor: ${t.vendor} • `}
                      {t.customer && `Customer: ${t.customer} • `}
                      {new Date(t.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`font-extrabold text-base ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.type === 'credit' ? '+' : ''}₹{Math.abs(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
