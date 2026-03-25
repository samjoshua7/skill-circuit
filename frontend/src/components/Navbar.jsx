import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Zap } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const { dbUser } = useAuth();
  const isAdmin  = dbUser?.role === 'Admin';
  const isVendor = dbUser?.role === 'Vendor';

  const homeUrl = dbUser
    ? isAdmin ? '/admin-dashboard' : isVendor ? '/vendor-dashboard' : '/marketplace'
    : '/';

  return (
    <header className="h-14 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center px-4 gap-3 shadow-sm">
      {/* Hamburger — mobile only, only when logged in */}
      {dbUser && (
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Logo */}
      <Link to={homeUrl} className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-extrabold text-slate-800 text-[15px] tracking-tight">
          Skill Circuit
        </span>
        {isAdmin && (
          <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200 tracking-wide">
            ADMIN
          </span>
        )}
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Guest CTA */}
      {!dbUser && (
        <Link
          to="/login"
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-sm shadow-blue-200"
        >
          Login / Register
        </Link>
      )}

      {/* Logged-in user: small avatar chip */}
      {dbUser && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {dbUser.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
            {dbUser.name?.split(' ')[0]}
          </span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
