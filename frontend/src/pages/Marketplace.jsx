import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Tag, Search, SlidersHorizontal, Wallet2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Repair', 'Teaching', 'Freelance', 'Cleaning', 'Design'];

const CATEGORY_META = {
  Repair:    { color: 'bg-orange-50 text-orange-600 border-orange-100',  emoji: '🔧' },
  Teaching:  { color: 'bg-blue-50 text-blue-600 border-blue-100',        emoji: '📚' },
  Freelance: { color: 'bg-purple-50 text-purple-600 border-purple-100',  emoji: '💼' },
  Cleaning:  { color: 'bg-green-50 text-green-600 border-green-100',     emoji: '🧹' },
  Design:    { color: 'bg-pink-50 text-pink-600 border-pink-100',        emoji: '🎨' },
  default:   { color: 'bg-slate-100 text-slate-600 border-slate-200',    emoji: '⚙️' },
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-36 bg-slate-100" />
    <div className="p-5">
      <div className="h-3 bg-slate-200 rounded-full w-1/4 mb-3" />
      <div className="h-5 bg-slate-200 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded-full w-full mb-1" />
      <div className="h-3 bg-slate-200 rounded-full w-5/6 mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200" />
          <div className="h-3 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
      </div>
    </div>
  </div>
);

// ── Service card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onBook }) => {
  const meta = CATEGORY_META[service.category] || CATEGORY_META.default;
  const score = parseFloat(service.createdBy?.reputationScore);

  // deterministic pastel banner colour from category
  const bannerPalette = {
    Repair:    'from-orange-400 to-amber-500',
    Teaching:  'from-blue-400 to-indigo-500',
    Freelance: 'from-purple-400 to-violet-500',
    Cleaning:  'from-green-400 to-emerald-500',
    Design:    'from-pink-400 to-rose-500',
    default:   'from-slate-400 to-slate-500',
  };
  const banner = bannerPalette[service.category] || bannerPalette.default;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm
      hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col">

      {/* Banner */}
      <div className={`h-28 bg-gradient-to-br ${banner} flex items-center justify-center relative`}>
        <span className="text-5xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300">
          {meta.emoji}
        </span>
        {/* Price badge pinned top-right */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800
          font-extrabold text-sm px-3 py-1 rounded-full shadow-sm">
          ₹{service.basePrice}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category pill */}
        <span className={`self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full border
          uppercase tracking-wider mb-2 ${meta.color}`}>
          {service.category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-1.5
          group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-slate-400 line-clamp-2 flex-1 mb-3">
          {service.description}
        </p>

        {/* Tags row */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-slate-400 bg-slate-50 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {service.location && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />{service.location}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
          {/* Vendor */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500
              flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {service.createdBy?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate max-w-[80px]">
                {service.createdBy?.name}
              </p>
              {score > 0 ? (
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[11px] font-bold">{score.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">New</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onBook(service)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold
              px-4 py-2 rounded-xl transition-all duration-150 shadow shadow-blue-200
              hover:shadow-blue-300 flex-shrink-0"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Marketplace = () => {
  const [services, setServices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]               = useState('');
  const { dbUser }                        = useAuth();
  const navigate                          = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then(r => setServices(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchCat    = activeCategory === 'All' || s.category === activeCategory;
    const term        = search.toLowerCase();
    const matchSearch = !term
      || s.title.toLowerCase().includes(term)
      || s.description.toLowerCase().includes(term)
      || s.createdBy?.name?.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Marketplace</h1>
            <p className="text-slate-400 text-sm mt-0.5">Discover and book skilled professionals</p>
          </div>
          {/* Wallet chip */}
          {dbUser?.walletBalance !== undefined && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200
              rounded-xl px-3.5 py-2 text-sm font-bold text-emerald-700 flex-shrink-0">
              <Wallet2 className="w-4 h-4" />
              ₹{dbUser.walletBalance} balance
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services, skills, or vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              text-sm shadow-sm placeholder:text-slate-400 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const m = CATEGORY_META[cat] || CATEGORY_META.default;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold
                  border flex-shrink-0 transition-all duration-150
                  ${isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                {cat !== 'All' && <span className="text-base leading-none">{m.emoji}</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-600 mb-1">No services found</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            {search ? `No results for "${search}". Try a different keyword.` : 'No services in this category yet. Check back soon!'}
          </p>
          {(search || activeCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-5 text-sm font-semibold text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Showing <span className="font-bold text-slate-600">{filtered.length}</span> service{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                onBook={s => navigate(`/book/${s._id}`, { state: { service: s } })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Marketplace;
