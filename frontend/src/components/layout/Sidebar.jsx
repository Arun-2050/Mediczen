import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Receipt,
  HelpCircle,
  Settings as SettingsIcon,
  Play,
  Pause,
  Info,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeSeconds = 0, setActiveSeconds = () => {}, onLogout = () => {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isTiming, setIsTiming] = useState(true);
  const [pauseCount, setPauseCount] = useState(0);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let interval = null;
    if (isTiming) {
      interval = setInterval(() => {
        setActiveSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming, setActiveSeconds]);

  const toggleTimer = () => {
    if (isTiming) {
      setPauseCount((prev) => prev + 1);
    }
    setIsTiming(!isTiming);
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  const navItemsMain = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Schedules', path: '/schedules', icon: Calendar },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Appointments', path: '/appointments', icon: CheckSquare },
    { name: 'Billing', path: '/billing', icon: Receipt },
  ];

  const navItemsSupport = [
    { name: 'Help Center', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between transition-all duration-300 z-20 shrink-0 min-h-screen p-5
        bg-white dark:bg-[#111318]
        border-r border-slate-200/80 dark:border-[#1f2028]
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header — logo color NEVER changes */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-[#1f2028]">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            {/* Blue logo icon - static, does NOT change in dark/light */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Mediczen<span className="text-blue-600 text-xs font-normal align-top ml-0.5">™</span>
              </span>
            )}
          </NavLink>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1c1e26] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="mt-6 space-y-6">
          {/* Main */}
          <div>
            {!collapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#52525b] mb-3 px-3">
                MAIN
              </p>
            )}
            <nav className="space-y-1">
              {navItemsMain.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-[#1a2035] text-blue-600 dark:text-[#4ade80] font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-[#71717a] hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1e26]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-[#4ade80]' : 'text-slate-400 dark:text-[#52525b]'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Support */}
          <div>
            {!collapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#52525b] mb-3 px-3">
                SUPPORT
              </p>
            )}
            <nav className="space-y-1">
              {navItemsSupport.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-[#1a2035] text-blue-600 dark:text-[#4ade80] font-semibold shadow-sm'
                        : 'text-slate-500 dark:text-[#71717a] hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1e26]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-[#4ade80]' : 'text-slate-400 dark:text-[#52525b]'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Working Track Stopwatch Widget */}
      {!collapsed && (
        <div className="mt-8 bg-slate-50 dark:bg-[#16181f] border border-slate-100 dark:border-[#1f2028] rounded-2xl p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-[#a1a1aa]">Working Track</span>
            <div className="relative">
              <Info
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-[#e4e4e7] transition-colors"
              />
              {/* Tooltip: shows how many times stopwatch was paused */}
              {showInfoTooltip && (
                <div className="absolute right-0 bottom-6 w-52 bg-[#18181b] text-white text-[11px] font-semibold rounded-xl p-3 shadow-xl z-50 space-y-1 border border-[#27272a]">
                  <p className="text-blue-400 font-bold">Session Tracker Info</p>
                  <p>Stopwatch paused: <span className="font-bold text-amber-400">{pauseCount} {pauseCount === 1 ? 'time' : 'times'}</span></p>
                  <p className="text-[10px] text-[#71717a] mt-1">Session time saves to Supabase on logout.</p>
                </div>
              )}
            </div>
          </div>

          {/* Timer display bar */}
          <div className="bg-blue-600 dark:bg-[#22c55e] rounded-xl p-2.5 text-white dark:text-[#0a0a0a] flex items-center justify-between shadow-md shadow-blue-500/20 dark:shadow-green-500/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-500/50 dark:bg-black/20 px-2 py-0.5 rounded-md font-medium text-blue-100 dark:text-[#052e16]">
                {todayDateStr}
              </span>
              <span className="text-xs font-mono font-bold tracking-tight">
                {formatTime(activeSeconds)}
              </span>
            </div>
            <button
              onClick={toggleTimer}
              className="w-7 h-7 rounded-lg bg-white/20 dark:bg-black/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              {isTiming ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
