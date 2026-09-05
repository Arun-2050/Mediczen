import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Settings, Bell, ChevronDown, LogOut, Mail, Stethoscope, Clock } from 'lucide-react';
import { getPatients } from '../../services/api';

export default function Header({
  doctor = { full_name: 'Dr. Medical', email: 'doctor@mediczen.com', avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', specialty: 'General Practitioner' },
  searchVal = '',
  setSearchVal = () => {},
  activeSeconds = 0,
  onLogout = () => {},
  hasUnreadAppointments = false,
  setHasUnreadAppointments = () => {}
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [livePatientCount, setLivePatientCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide Search Bar on Help, Settings, and Schedules
  const isSearchHidden =
    location.pathname === '/help' ||
    location.pathname === '/settings' ||
    location.pathname === '/schedules';

  // Fetch real-time patient count from Supabase for ALL pages
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const patients = await getPatients();
        setLivePatientCount(patients.length);
      } catch {
        setLivePatientCount(0);
      }
    };
    fetchCount();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleBellClick = () => {
    setHasUnreadAppointments(false);
    navigate('/appointments');
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative">
      {/* Dynamic Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getGreeting()}, {doctor?.full_name || 'Doctor'}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#71717a] font-medium mt-1">
          I hope you're in a good mood because there are{' '}
          <span className="font-semibold text-slate-700 dark:text-[#a1a1aa]">{livePatientCount} patients</span> waiting for you
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        {!isSearchHidden && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, ward..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-white dark:bg-[#16181f] border border-slate-200/80 dark:border-[#1f2028] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-[#e4e4e7] placeholder-slate-400 dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        )}

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#16181f] border border-slate-200/80 dark:border-[#1f2028] flex items-center justify-center text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1e26] transition-colors shadow-sm"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 rounded-xl bg-white dark:bg-[#16181f] border border-slate-200/80 dark:border-[#1f2028] flex items-center justify-center text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1e26] transition-colors shadow-sm"
            title="Appointments Alerts"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadAppointments && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-[#16181f] animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Doctor Avatar & Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 border-l border-slate-200/80 dark:border-[#1f2028] cursor-pointer group"
          >
            <img
              src={doctor?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
              alt={doctor?.full_name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-sm group-hover:ring-blue-500/50 transition-all"
            />
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 top-14 w-80 bg-white dark:bg-[#16181f] border border-slate-100 dark:border-[#1f2028] rounded-2xl shadow-2xl p-5 z-50 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#1f2028]">
                <img
                  src={doctor?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                  alt={doctor?.full_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{doctor?.full_name || 'Doctor'}</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{doctor?.specialty || 'General Practitioner'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-[#a1a1aa] font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{doctor?.email || 'doctor@mediczen.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                  <span>Specialty: {doctor?.specialty || 'General Practitioner'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Session Time: <strong className="font-mono text-slate-800 dark:text-[#e4e4e7]">{formatTime(activeSeconds)}</strong></span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#1f2028] flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:text-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
