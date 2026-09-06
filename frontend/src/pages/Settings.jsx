import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { updateDoctorProfile } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Moon, Sun, Upload, Mail, Stethoscope, Clock, Check } from 'lucide-react';

export default function Settings({ doctor = {}, setDoctor = () => {}, activeSeconds = 0, darkMode = false, setDarkMode = () => {} }) {
  const [fullName, setFullName] = useState(doctor.full_name || 'Dr. Medical');
  const [specialty, setSpecialty] = useState(doctor.specialty || 'General Practitioner');
  const [avatarUrl, setAvatarUrl] = useState(doctor.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150');
  const [saved, setSaved] = useState(false);
  const [savedActiveSeconds, setSavedActiveSeconds] = useState(doctor?.active_seconds || 0);

  // Fetch saved total active time from Supabase in real time
  useEffect(() => {
    if (!doctor?.id) return;
    setSavedActiveSeconds(doctor.active_seconds || 0);
    const fetchSavedTime = async () => {
      const { data } = await supabase.from('doctors').select('active_seconds').eq('id', doctor.id).single();
      if (data) setSavedActiveSeconds(data.active_seconds || 0);
    };
    fetchSavedTime();
    // Real-time update when the doctor table changes (e.g. on logout save)
    const channel = supabase
      .channel('doctor-active-time')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'doctors', filter: `id=eq.${doctor.id}` }, (payload) => {
        setSavedActiveSeconds(payload.new?.active_seconds || 0);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [doctor?.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = {
      ...doctor,
      full_name: fullName,
      specialty,
      avatar_url: avatarUrl
    };
    if (doctor.id) {
      await updateDoctorProfile(doctor.id, {
        full_name: fullName,
        specialty,
        avatar_url: avatarUrl
      });
    }
    setDoctor(updated);
    localStorage.setItem('mediczen_doctor', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Total = saved in Supabase + current live session
  const totalActiveSeconds = savedActiveSeconds + activeSeconds;

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="light-theme-page p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header (Search bar hidden automatically via location.pathname === '/settings') */}
      <Header doctor={doctor} activeSeconds={activeSeconds} />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account & System Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Customize display theme, update profile photo avatar, and manage doctor profile details
          </p>
        </div>

        {saved && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile and theme settings successfully saved to Supabase!</span>
          </div>
        )}

        {/* Theme Settings Card */}
        <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme Mode</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Choose your preferred visual theme for the Mediczen dashboard.</p>
          
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => setDarkMode(false)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                !darkMode
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-white shadow-sm ring-2 ring-blue-500/50'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Doctor Details & Avatar Upload Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Profile Information</h3>

          <div className="flex items-center gap-6 pb-4 border-b border-slate-100 dark:border-[#1f2028]">
            <img
              src={avatarUrl}
              alt="Doctor Avatar"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 dark:ring-slate-700 shadow-md"
            />
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-500/20">
                <Upload className="w-4 h-4" />
                <span>Upload New Avatar</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Recommended format: JPG/PNG, 400x400px photo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Doctor Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Specialty</label>
              <input
                type="text"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Doctor Email ID</span>
              <p className="font-bold text-slate-800 dark:text-white mt-0.5">{doctor.email || 'doctor@mediczen.com'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Supabase ID</span>
              <p className="font-mono text-slate-600 dark:text-slate-300 mt-0.5 text-[11px] truncate">{doctor.id || 'Default'}</p>
            </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-[#52525b]">Total Active Track Time</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{formatTime(totalActiveSeconds)}</p>
                <p className="text-[10px] text-slate-400 dark:text-[#52525b] mt-0.5">Saved: {formatTime(savedActiveSeconds)} + Session: {formatTime(activeSeconds)}</p>
              </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
