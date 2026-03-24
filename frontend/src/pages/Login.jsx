import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginWithGoogle, dbUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('Customer');
  const [panOrGstin, setPanOrGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (dbUser) {
    navigate('/dashboard');
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      if (role === 'Vendor' && !panOrGstin) {
        setError('Vendors must provide PAN or GSTIN for verification');
        setLoading(false);
        return;
      }
      await loginWithGoogle(role, panOrGstin);
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in with Google. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-8">Welcome to Skill Circuit</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">I am signing up as a:</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setRole('Customer')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${role === 'Customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setRole('Vendor')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${role === 'Vendor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Vendor
            </button>
          </div>
        </div>

        {role === 'Vendor' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">PAN or GSTIN (Required for Vendors)</label>
            <input 
              type="text" 
              value={panOrGstin}
              onChange={(e) => setPanOrGstin(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter your PAN or GSTIN"
              required
            />
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition drop-shadow-sm disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google logo" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <p className="mt-6 text-center text-sm text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
