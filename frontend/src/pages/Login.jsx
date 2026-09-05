import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginDoctor, registerDoctor } from '../services/api';
import { Activity, Mail, Lock, User, Stethoscope, Upload, ArrowRight, Check } from 'lucide-react';

export default function Login({ setDoctor = () => {} }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('dr.andreas@mediczen.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Dr. Andreas');
  const [specialty, setSpecialty] = useState('Cardiologist');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      let docData;
      if (isRegister) {
        docData = await registerDoctor({
          email,
          password,
          full_name: fullName,
          specialty,
          avatar_url: avatarUrl
        });
      } else {
        docData = await loginDoctor({ email, password });
      }

      if (docData) {
        localStorage.setItem('mediczen_doctor', JSON.stringify(docData));
        setDoctor(docData);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Mediczen<span className="text-blue-600 text-xs font-normal align-top ml-0.5">™</span>
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isRegister ? 'Create Doctor Account' : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {isRegister
                ? 'Register into the hospital database to access your doctor dashboard.'
                : 'Sign in to access your clinical dashboard & patient list.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegister && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Andreas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Specialty</label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="General Practitioner">General Practitioner</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Surgeon">Surgeon</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Upload Feature */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Avatar Photo</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />
                    <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl p-2.5 text-center text-xs font-semibold text-slate-600 flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Upload Profile Photo</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.andreas@mediczen.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Sign In' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {isRegister ? 'Already registered?' : "Don't have a doctor account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-bold text-blue-600 hover:underline ml-1"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-4">
            Need help? Contact hospital IT support at <span className="font-semibold text-slate-600">support@mediczen.org</span>
          </div>
        </div>

        {/* Right Side Visual Showcase (Image 2 style) */}
        <div className="hidden md:flex relative bg-slate-900 p-10 flex-col justify-between overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
            alt="Medical Practice"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          
          <div className="relative z-10 text-white/80 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Real-Time Connected</span>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white space-y-3">
            <p className="text-base font-bold leading-relaxed">
              "Precision medicine and real-time clinical workflows are the new gold standard for patient care."
            </p>
            <div className="text-xs text-blue-200 font-medium">
              Integrated with Supabase PostgreSQL & AI Diagnostic Decision Support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
