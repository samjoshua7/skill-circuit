import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, BookOpen, Wallet, LayoutDashboard, Briefcase,
  ClipboardList, Star, LogOut, Shield, X,
  PlusCircle, ChevronRight, Zap
} from 'lucide-react';

// ── Menu definitions per role ─────────────────────────────────────────────────
const CUSTOMER_MENU = [
  { label: 'Marketplace', path: '/marketplace',  icon: ShoppingBag },
  { label: 'My Bookings', path: '/my-bookings',  icon: BookOpen    },
  { label: 'Wallet',      path: '/wallet',        icon: Wallet      },
];

const VENDOR_MENU = [
  { label: 'Dashboard',   path: '/vendor-dashboard', icon: LayoutDashboard },
  { label: 'My Services', path: '/my-services',      icon: Briefcase       },
  { label: 'Add Service', path: '/create-service',   icon: PlusCircle      },
  { label: 'Orders',      path: '/incoming-orders',  icon: ClipboardList   },
  { label: 'Reviews',     path: '/vendor-reviews',   icon: Star            },
  { label: 'Wallet',      path: '/wallet',           icon: Wallet          },
];

const ADMIN_MENU = [
  { label: 'Admin Panel', path: '/admin-dashboard', icon: Shield },
];

// ── Accent themes per role ────────────────────────────────────────────────────
const ROLE_ACCENT = {
  Customer: {
    active:   'bg-blue-600 text-white shadow-md shadow-blue-200',
    hover:    'hover:bg-blue-50 hover:text-blue-700',
    gradient: 'from-blue-500 to-indigo-600',
    ring:     'ring-blue-200',
    label:    'Customer',
    labelCls: 'text-blue-500',
  },
  Vendor: {
    active:   'bg-indigo-600 text-white shadow-md shadow-indigo-200',
    hover:    'hover:bg-indigo-50 hover:text-indigo-700',
    gradient: 'from-indigo-500 to-purple-600',
    ring:     'ring-indigo-200',
    label:    'Vendor',
    labelCls: 'text-indigo-500',
  },
  Admin: {
    active:   'bg-rose-600 text-white shadow-md shadow-rose-200',
    hover:    'hover:bg-rose-50 hover:text-rose-700',
    gradient: 'from-rose-500 to-red-600',
    ring:     'ring-rose-200',
    label:    'Admin',
    labelCls: 'text-rose-500',
  },
};

// ── Single nav item ───────────────────────────────────────────────────────────
const NavItem = ({ item, accent, walletBalance, onClose }) => {
  const Icon = item.icon;
  const isWallet = item.path === '/wallet';
  return (
    <NavLink
      to={item.path}
      end={item.path === '/marketplace'}
      onClick={onClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
         ${isActive ? accent.active : `text-slate-500 ${accent.hover}`}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors
            ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-current'}`}
          />
          <span className="flex-1 truncate">{item.label}</span>

          {/* Wallet balance pill */}
          {isWallet && walletBalance !== undefined && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
              ${isActive ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              ₹{walletBalance}
            </span>
          )}

          {/* Hover arrow */}
          {!isActive && (
            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
};

// ── Sidebar shell ─────────────────────────────────────────────────────────────
const Sidebar = ({ mobileOpen, onClose }) => {
  const { dbUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!dbUser) return null;

  const role   = dbUser.role;
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.Customer;
  const menu   = role === 'Vendor' ? VENDOR_MENU
               : role === 'Admin'  ? ADMIN_MENU
               : CUSTOMER_MENU;

  const homeUrl = role === 'Admin'  ? '/admin-dashboard'
                : role === 'Vendor' ? '/vendor-dashboard'
                : '/marketplace';

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/');
  };

  /* ── Inner content (shared between desktop and mobile drawer) ── */
  const content = (
    <div className="flex flex-col h-full select-none">

      {/* Brand header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <NavLink to={homeUrl} onClick={onClose} className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent.gradient}
            flex items-center justify-center shadow-sm flex-shrink-0`}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-extrabold text-slate-800 tracking-tight">Skill Circuit</p>
            <p className={`text-[11px] font-semibold ${accent.labelCls}`}>{accent.label}</p>
          </div>
        </NavLink>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav links — scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Menu
        </p>
        {menu.map(item => (
          <NavItem
            key={item.path}
            item={item}
            accent={accent}
            walletBalance={dbUser.walletBalance}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* Bottom: profile + logout — ALWAYS visible, never clipped */}
      <div className="flex-shrink-0 border-t border-slate-100 px-3 pt-3 pb-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Account
        </p>

        {/* Avatar + name card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${accent.gradient}
            flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {dbUser.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
              {dbUser.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{dbUser.email}</p>
          </div>
        </div>

        {/* Logout button — always rendered, never clipped */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
        >
          <LogOut className="w-[18px] h-[18px] text-slate-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: sticky left column ── */}
      <aside className="hidden lg:flex flex-col w-[230px] flex-shrink-0 bg-white border-r border-slate-100 h-[calc(100vh-56px)] sticky top-14">
        {content}
      </aside>

      {/* ── Mobile: slide-in drawer overlay ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-[230px] bg-white z-50 shadow-2xl flex flex-col lg:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
