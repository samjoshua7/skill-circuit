import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Repair', 'Teaching', 'Freelance', 'Cleaning', 'Delivery', 'Design', 'Other'];

const CreateServicePage = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    basePrice: '',
    location: 'Tirunelveli',
    tags: '',
  });

  // serviceflow as a dynamic list
  const [serviceflow, setServiceflow] = useState(['start', 'working', 'done']);
  const [newStep, setNewStep] = useState('');

  const [status, setStatus] = useState({ type: '', message: '' }); // 'success' | 'error'
  const [loading, setLoading] = useState(false);

  // Redirect non-vendors away
  if (!dbUser) return navigate('/login');
  if (dbUser.role !== 'Vendor') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-red-500 font-semibold text-lg">Only Vendors can create services.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Service Flow Handlers ---
  const addStep = () => {
    const step = newStep.trim();
    if (!step) return;
    setServiceflow([...serviceflow, step]);
    setNewStep('');
  };

  const removeStep = (index) => {
    if (serviceflow.length <= 3) {
      setStatus({ type: 'error', message: 'Service flow must have at least 3 steps.' });
      return;
    }
    setServiceflow(serviceflow.filter((_, i) => i !== index));
    setStatus({ type: '', message: '' });
  };

  const handleStepEdit = (index, value) => {
    const updated = [...serviceflow];
    updated[index] = value;
    setServiceflow(updated);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Client-side validation
    if (form.title.trim().length < 3) {
      return setStatus({ type: 'error', message: 'Title must be at least 3 characters.' });
    }
    if (form.description.trim().length < 10) {
      return setStatus({ type: 'error', message: 'Description must be at least 10 characters.' });
    }
    if (!form.category) {
      return setStatus({ type: 'error', message: 'Please select a category.' });
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      return setStatus({ type: 'error', message: 'Base Price must be greater than 0.' });
    }
    if (serviceflow.length < 3) {
      return setStatus({ type: 'error', message: 'Service flow must have at least 3 steps.' });
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/services/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': dbUser._id,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          basePrice: Number(form.basePrice),
          serviceflow,
          location: form.location.trim(),
          tags: tagsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
      } else {
        setStatus({ type: 'success', message: '✅ Service created successfully! Redirecting...' });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create New Service</h1>
        <p className="text-slate-500 text-sm mb-8">
          Fill in the details below. All fields marked <span className="text-red-500">*</span> are required.
        </p>

        {status.message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Service Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder='e.g. "TV Repair", "Keyboard Classes for Beginners"'
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your service in detail..."
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
            />
          </div>

          {/* Category + Base Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Base Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 500"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Tirunelveli"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Service Flow */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Service Flow <span className="text-red-500">*</span>{' '}
              <span className="text-slate-400 font-normal text-xs">(min 3 steps)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">
              These are the status stages your service goes through (e.g. start → working → done).
            </p>
            <div className="space-y-2 mb-3">
              {serviceflow.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5 text-right">{i + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepEdit(i, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold leading-none transition"
                    title="Remove step"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                placeholder="Add new step..."
                className="flex-1 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              <button
                type="button"
                onClick={addStep}
                className="bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tags <span className="text-slate-400 font-normal text-xs">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder='e.g. "electronics, home service, affordable"'
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-700 text-sm transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateServicePage;
