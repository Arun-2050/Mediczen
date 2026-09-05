import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { getAppointments, deleteAppointment } from '../services/api';
import { Clock, User, Plus, FileText, X, Sparkles, Activity, Trash2, RotateCcw, Calendar } from 'lucide-react';

export default function Appointments({
  doctor = {},
  monthFilter = null,
  monthFilterLabel = '',
  onResetMonthFilter = () => {}
}) {
  const [appointments, setAppointments] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [selectedConsult, setSelectedConsult] = useState(null);

  const fetchAppointments = async () => {
    const data = await getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDeleteApt = async (id) => {
    await deleteAppointment(id);
    await fetchAppointments();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter logic: if monthFilter is active (e.g. '2026-08'), filter by that month prefix
  const activeAppointments = monthFilter
    ? appointments.filter((a) => a.appointment_date && a.appointment_date.startsWith(monthFilter))
    : appointments;

  const todayAppointments = activeAppointments.filter(
    (a) => a.appointment_date === todayStr || a.status === 'Today'
  );

  const upcomingAppointments = activeAppointments.filter(
    (a) => a.appointment_date !== todayStr && a.status !== 'Today'
  );

  return (
    <div className="light-theme-page p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <Header doctor={doctor} searchVal={searchVal} setSearchVal={setSearchVal} />

      {/* Month Filter Active Banner */}
      {monthFilter && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                Showing Filtered Appointments for {monthFilterLabel || monthFilter}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Data hydrated from Supabase calendar month filter selection.
              </p>
            </div>
          </div>
          <button
            onClick={onResetMonthFilter}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Current Month</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Clinical Appointments Manager</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Scheduled patient consultations and follow-up visits</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Subsection 1: Today's Appointments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Appointments ({todayAppointments.length})
            </h3>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="bg-white dark:bg-[#111318] rounded-2xl p-6 border border-slate-100 dark:border-[#1f2028] shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.start_time || apt.time || '09:30 AM'}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        Today
                      </span>
                      <button
                        onClick={() => handleDeleteApt(apt.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{apt.patient_name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{apt.reason || 'General Consult'}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                    <span>Date: {apt.appointment_date || todayStr}</span>
                    <button
                      onClick={() => setSelectedConsult(apt)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Start Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">No appointments scheduled for today.</p>
          )}
        </div>

        {/* Subsection 2: Upcoming Appointments in This Month */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Appointments in This Month ({upcomingAppointments.length})
            </h3>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="bg-white dark:bg-[#111318] rounded-2xl p-6 border border-slate-100 dark:border-[#1f2028] shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.start_time || apt.time || '10:00 AM'}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        {apt.status || 'Scheduled'}
                      </span>
                      <button
                        onClick={() => handleDeleteApt(apt.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{apt.patient_name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{apt.reason || 'General Consult'}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                    <span>Date: {apt.appointment_date}</span>
                    <button
                      onClick={() => setSelectedConsult(apt)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Start Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">No upcoming appointments recorded for this period.</p>
          )}
        </div>
      </div>

      {/* Start Consult Details Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Consultation Details</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Patient: {selectedConsult.patient_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedConsult(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Reason for Visit</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedConsult.reason || 'Routine Checkup & Diagnostics'}</p>
                <p className="text-slate-500 dark:text-slate-400">Scheduled Date: {selectedConsult.appointment_date} at {selectedConsult.start_time || '10:00 AM'}</p>
              </div>

              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Reported Symptoms & Patient Medical History</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Patient presents with reported symptoms: Fever, acute physical pain, respiratory discomfort for 3 days. Elevated BP (130/85), pulse 88 bpm, SpO2 97%.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedConsult(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Close Consultation Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
