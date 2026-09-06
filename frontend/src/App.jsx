import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Schedules from './pages/Schedules';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';
import PatientPortal from './pages/PatientPortal';
import Login from './pages/Login';
import { updateDoctorActiveTime } from './services/api';
import { supabase } from './services/supabaseClient';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('mediczen_theme') === 'dark';
  });
  const [doctor, setDoctor] = useState(() => {
    const saved = localStorage.getItem('mediczen_doctor');
    return saved ? JSON.parse(saved) : null;
  });

  // Timer always starts from 0 on fresh login — only accumulated total from Supabase is shown in Settings
  const [activeSeconds, setActiveSeconds] = useState(0);
  const activeSecondsRef = useRef(0);
  const [monthFilter, setMonthFilter] = useState(null);
  const [monthFilterLabel, setMonthFilterLabel] = useState('');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState(null);
  const [hasUnreadAppointments, setHasUnreadAppointments] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Persist theme preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mediczen_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mediczen_theme', 'light');
    }
  }, [darkMode]);

  // Reset timer to 0 whenever a new doctor logs in
  useEffect(() => {
    if (doctor?.id) {
      setActiveSeconds(0);
      activeSecondsRef.current = 0;
    }
  }, [doctor?.id]);

  useEffect(() => {
    activeSecondsRef.current = activeSeconds;
  }, [activeSeconds]);

  // Persist session checkpoints so a reload or unexpected tab close does not lose time.
  useEffect(() => {
    if (!doctor?.id) return undefined;
    const checkpoint = async () => {
      const secondsToSave = activeSecondsRef.current;
      if (secondsToSave <= 0) return;
      const totalActiveSeconds = await updateDoctorActiveTime(doctor.id, secondsToSave);
      if (totalActiveSeconds !== null) {
        activeSecondsRef.current = Math.max(0, activeSecondsRef.current - secondsToSave);
        setActiveSeconds((current) => Math.max(0, current - secondsToSave));
      }
    };
    const intervalId = window.setInterval(checkpoint, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [doctor?.id]);

  const handleLogout = async () => {
    // Save current session seconds to Supabase before logging out
    const secondsToSave = activeSecondsRef.current;
    if (doctor?.id && secondsToSave > 0) {
      const totalActiveSeconds = await updateDoctorActiveTime(doctor.id, secondsToSave);
      if (totalActiveSeconds !== null) {
        const updatedDoctor = { ...doctor, active_seconds: totalActiveSeconds };
        localStorage.setItem('mediczen_doctor', JSON.stringify(updatedDoctor));
      }
    }
    localStorage.removeItem('mediczen_doctor');
    await supabase.auth.signOut();
    setDoctor(null);
    setActiveSeconds(0);
    navigate('/login');
  };

  const handleSelectMonthFilter = (monthStr, monthLabel) => {
    setMonthFilter(monthStr);
    setMonthFilterLabel(monthLabel);
    setAppointmentDateFilter(null);
  };

  const handleSelectAppointmentDate = (dateStr, dateLabel) => {
    setAppointmentDateFilter({ date: dateStr, label: dateLabel });
    setMonthFilter(null);
    setMonthFilterLabel('');
  };

  const handleResetMonthFilter = () => {
    setMonthFilter(null);
    setMonthFilterLabel('');
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/portal');

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setDoctor={setDoctor} />} />
        <Route path="/portal/:token" element={<PatientPortal />} />
      </Routes>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-[#0d0f12] text-[#e4e4e7]' : 'bg-white text-black'}`}>
      <Sidebar
        doctor={doctor}
        activeSeconds={activeSeconds}
        setActiveSeconds={setActiveSeconds}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Dashboard
                doctor={doctor}
                activeSeconds={activeSeconds}
                onLogout={handleLogout}
                onSelectMonthFilter={handleSelectMonthFilter}
                onSelectAppointmentDate={handleSelectAppointmentDate}
                hasUnreadAppointments={hasUnreadAppointments}
                setHasUnreadAppointments={setHasUnreadAppointments}
              />
            }
          />
          <Route path="/patients" element={<Patients doctor={doctor} />} />
          <Route path="/schedules" element={<Schedules doctor={doctor} />} />
          <Route path="/appointments" element={<Appointments doctor={doctor} monthFilter={monthFilter} monthFilterLabel={monthFilterLabel} appointmentDateFilter={appointmentDateFilter} onResetMonthFilter={() => { handleResetMonthFilter(); setAppointmentDateFilter(null); }} />} />
          <Route path="/billing" element={<Billing doctor={doctor} />} />
          <Route path="/help" element={<HelpCenter doctor={doctor} />} />
          <Route
            path="/settings"
            element={
              <Settings
                doctor={doctor}
                setDoctor={setDoctor}
                activeSeconds={activeSeconds}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
