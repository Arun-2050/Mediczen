import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { addDays, format, startOfMonth } from 'date-fns';

export default function ScheduleTimeline({ schedules = [] }) {
  const [selectedWeek, setSelectedWeek] = useState('Week 1 (Days 1-7)');
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const weeks = [
    'Week 1 (Days 1-7)',
    'Week 2 (Days 7-14)',
    'Week 3 (Days 14-21)',
    'Week 4 (Days 21-28)'
  ];
  const weekIndex = weeks.indexOf(selectedWeek);
  const weekDays = useMemo(() => {
    const firstDay = addDays(startOfMonth(new Date()), weekIndex * 7);
    return Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));
  }, [weekIndex]);
  const visibleSchedules = schedules.filter((schedule) => {
    const date = schedule.schedule_date || schedule.date;
    return date && weekDays.some((day) => format(day, 'yyyy-MM-dd') === date);
  });

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
            <div className="col-span-8 text-left">Selected dates and tasks</div>
          </div>

          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const daySchedules = visibleSchedules.filter((schedule) => (schedule.schedule_date || schedule.date) === dayKey);
            return (
              <div key={dayKey} className="grid grid-cols-[120px_1fr] items-start gap-4 py-4 border-b border-slate-50 dark:border-slate-700/50 text-xs">
                <div className="font-bold text-slate-500 dark:text-slate-400">{format(day, 'EEE, MMM d')}</div>
                <div className="flex flex-wrap gap-2">
                  {daySchedules.length ? daySchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl px-3 py-2 font-bold text-[11px] shadow-sm">
                      {schedule.start_time} - {schedule.end_time} {schedule.title}
                    </div>
                  )) : <span className="text-slate-300 dark:text-slate-600 italic">No tasks scheduled</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
