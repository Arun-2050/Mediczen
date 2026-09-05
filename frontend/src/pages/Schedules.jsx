import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { getSchedules, createSchedule } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Plus, X, Clock, CalendarDays, CheckSquare2, Trash2 } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_COLORS = {
  Checkup:    'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
  Surgery:    'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  Break:      'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300',
  Evaluation: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300',
  Meeting:    'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  Other:      'bg-slate-100 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
};

export default function Schedules({ doctor = {} }) {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Mon');
  // Each day can have multiple time slots - represented as { time, task, type }
  const [timeSlots, setTimeSlots] = useState([{ time: '09:00', task: '', type: 'Checkup' }]);
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async () => {
    const data = await getSchedules();
    setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();

    // Real-time subscription
    const channel = supabase
      .channel('schedules-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchSchedules)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const addTimeSlot = () => {
    setTimeSlots((prev) => [...prev, { time: '10:00', task: '', type: 'Checkup' }]);
  };

  const removeTimeSlot = (idx) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx, field, value) => {
    setTimeSlots((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const slot of timeSlots) {
        if (!slot.task.trim()) continue;
        await createSchedule({
          title: slot.task,
          day: selectedDay,
          start_time: slot.time,
          end_time: slot.time,
          type: slot.type,
          schedule_date: new Date().toISOString().split('T')[0]
        });
      }
      await fetchSchedules();
      setShowAddModal(false);
      setTimeSlots([{ time: '09:00', task: '', type: 'Checkup' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Group schedules by day
  const schedulesByDay = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day === day);
    return acc;
  }, {});

  return (
    <div className="light-theme-page p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <Header doctor={doctor} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Clinical Schedule Manager</h2>
          <p className="text-xs text-slate-500 dark:text-[#71717a] font-medium mt-1">
            Organize your weekly schedule — surgeries, consultations, and ward evaluations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-100 dark:border-[#1f2028] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-[#1f2028]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Schedule</h3>
          <p className="text-xs text-slate-400 dark:text-[#52525b] mt-0.5">All scheduled tasks for each day of the week</p>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-[#1f2028]">
          {DAYS.map((day) => (
            <div key={day} className="flex items-start gap-6 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-[#16181f] transition-colors">
              {/* Day label */}
              <div className="w-12 shrink-0 pt-1">
                <span className="text-xs font-bold text-slate-400 dark:text-[#52525b]">{day}</span>
              </div>

              {/* Schedule items for this day */}
              <div className="flex flex-wrap gap-2 flex-1">
                {schedulesByDay[day].length === 0 ? (
                  <span className="text-[11px] text-slate-300 dark:text-[#3f3f46] italic">No tasks scheduled</span>
                ) : (
                  schedulesByDay[day].map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-sm ${TYPE_COLORS[s.type] || TYPE_COLORS.Other}`}
                    >
                      <Clock className="w-3 h-3 opacity-70" />
                      <span>{s.start_time}</span>
                      <span className="w-px h-3 bg-current opacity-30" />
                      <span>{s.title}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add quick-task button */}
              <button
                onClick={() => {
                  setSelectedDay(day);
                  setShowAddModal(true);
                }}
                className="shrink-0 w-7 h-7 rounded-lg border-2 border-dashed border-slate-200 dark:border-[#27272a] text-slate-300 dark:text-[#3f3f46] hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center"
                title={`Add task for ${day}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Add Schedule Modal ─── */}
      {showAddModal && (
        <div className="light-theme-modal fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-[#1f2028] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1f2028] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add to Schedule</h3>
                  <p className="text-xs text-slate-400 dark:text-[#71717a] font-medium">Pick a day and add your tasks</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1c1e26] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-5 text-xs">
              {/* Day selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-2">Select Day</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                        selectedDay === d
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-[#1c1e26] text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-200 dark:hover:bg-[#27272a]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700 dark:text-[#a1a1aa] uppercase">Time Slots</label>
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Time</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-[#16181f] rounded-xl p-3 border border-slate-100 dark:border-[#1f2028]">
                      {/* Index label */}
                      <span className="text-[10px] font-bold text-slate-400 dark:text-[#52525b] w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Time input */}
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateSlot(idx, 'time', e.target.value)}
                        className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1f2028] rounded-lg px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-white w-28 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      {/* Task input */}
                      <input
                        type="text"
                        placeholder="Task name..."
                        value={slot.task}
                        onChange={(e) => updateSlot(idx, 'task', e.target.value)}
                        className="flex-1 bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1f2028] rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      {/* Type selector */}
                      <select
                        value={slot.type}
                        onChange={(e) => updateSlot(idx, 'type', e.target.value)}
                        className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1f2028] rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-[#a1a1aa] font-medium focus:outline-none shrink-0"
                      >
                        {Object.keys(TYPE_COLORS).map((t) => <option key={t}>{t}</option>)}
                      </select>

                      {/* Remove slot */}
                      {timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(idx)}
                          className="p-1 text-slate-300 dark:text-[#3f3f46] hover:text-rose-500 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <CheckSquare2 className="w-4 h-4" />
                {saving ? 'Saving to Supabase...' : `Add to ${selectedDay} Schedule`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
