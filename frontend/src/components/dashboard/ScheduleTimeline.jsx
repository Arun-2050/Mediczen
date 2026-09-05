import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ScheduleTimeline({ schedules = [] }) {
  const [selectedWeek, setSelectedWeek] = useState('Week 1 (Days 1-7)');
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const weeks = [
    'Week 1 (Days 1-7)',
    'Week 2 (Days 7-14)',
    'Week 3 (Days 14-21)',
    'Week 4 (Days 21-28)'
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Take a look to your schedule for this month
          </p>
        </div>

        {/* Week Selector Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowWeekDropdown(!showWeekDropdown)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <span>{selectedWeek}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showWeekDropdown && (
            <div className="light-theme-menu absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 space-y-1 text-xs">
              {weeks.map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setSelectedWeek(w);
                    setShowWeekDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedWeek === w ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Hours Header Row */}
          <div className="grid grid-cols-[80px_repeat(8,1fr)] border-b border-slate-100 dark:border-slate-700 pb-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">
            <div></div>
            {hours.map((h) => (
              <div key={h}>{h}</div>
            ))}
          </div>

          {/* Monday Row */}
          <div className="grid grid-cols-[80px_repeat(8,1fr)] items-center py-4 border-b border-slate-50 dark:border-slate-700/50 text-xs">
            <div className="font-bold text-slate-400 dark:text-slate-500 text-center">Mon</div>
            <div className="col-span-8 grid grid-cols-8 gap-2 relative h-10 items-center">
              <div className="col-start-2 col-span-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl px-3 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm">
                Check up patient
              </div>
              <div className="col-start-4 col-span-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl px-2 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm whitespace-nowrap">
                Lunch Break
              </div>
              <div className="col-start-5 col-span-3 bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl px-3 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm">
                Heart Surgery
              </div>
            </div>
          </div>

          {/* Tuesday Row */}
          <div className="grid grid-cols-[80px_repeat(8,1fr)] items-center py-4 border-b border-slate-50 dark:border-slate-700/50 text-xs">
            <div className="font-bold text-slate-400 dark:text-slate-500 text-center">Tue</div>
            <div className="col-span-8 grid grid-cols-8 gap-2 relative h-10 items-center">
              <div className="col-start-2 col-span-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl px-3 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm">
                Check up patient
              </div>
              <div className="col-start-4 col-span-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl px-2 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm whitespace-nowrap">
                Lunch Break
              </div>
              <div className="col-start-5 col-span-2 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 rounded-xl px-3 py-2 font-bold text-[11px] flex items-center justify-center shadow-sm">
                Evaluation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
