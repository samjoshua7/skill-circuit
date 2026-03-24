import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, BookOpen, Search, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl mb-6">
          Find Local Skills <span className="text-blue-600">On Demand</span>
        </h1>
        <p className="mt-4 text-xl text-slate-600 mb-10">
          The easiest way to hire professionals for teaching, repairs, and freelance work in your local community.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/services" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
            Browse Services
          </Link>
          <Link to="/login" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all">
            Become a Vendor
          </Link>
        </div>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-6">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Expert Repairs</h3>
          <p className="text-slate-600">Find vetted technicians to fix appliances, gadgets, and household issues fast.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition">
          <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Local Tutors</h3>
          <p className="text-slate-600">Connect with skilled teachers for personalized lessons in any subject.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Trust & Safety</h3>
          <p className="text-slate-600">Real reviews and verified vendors ensure you get the best quality service.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
