import React, { useState } from 'react';
import { X, UserPlus, Calendar, Phone } from 'lucide-react';
import { createPatient } from '../../services/api';

export default function PatientFormModal({ onClose = () => {}, onRefresh = () => {} }) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [wardNo, setWardNo] = useState('#' + Math.floor(100000 + Math.random() * 900000));
  const [priority, setPriority] = useState('Medium');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('General Clinical Consultation');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) return;
    setLoading(true);
    try {
      const parsedAge = Math.max(0, parseInt(age) || 0);
      await createPatient({
        full_name: fullName,
        gender,
        age: parsedAge,
        ward_no: wardNo,
        priority,
        phone,
        email,
        start_date: appointmentDate,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-theme-modal fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Patient</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Enter patient details into ward registry & schedule appointment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Age (Min 0)</label>
              <input
                type="number"
                min="0"
                required
                value={age}
                onChange={(e) => setAge(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="25"
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0192"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-3 text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Ward No.</label>
              <input
                type="text"
                value={wardNo}
                onChange={(e) => setWardNo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-mono font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Appointment Scheduling Fields */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 text-xs">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Initial Appointment Schedule</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Appointment Time</label>
                <input
                  type="text"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consultation Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. General Clinical Intake"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            {loading ? 'Creating Patient & Appointment in Supabase...' : 'Register Patient & Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
}
