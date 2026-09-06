import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function CalendarWidget({ appointments = [], onSelectMonthFilter = () => {}, onSelectAppointmentDate = () => {} }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isCurrentRealMonth = isSameMonth(currentMonth, new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const hasAppointment = (day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return appointments.some((apt) => apt.appointment_date === formattedDay);
  };

  const handleMonthFilterClick = () => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const monthLabel = format(currentMonth, 'MMMM yyyy');
    onSelectMonthFilter(monthStr, monthLabel);
    navigate('/appointments');
  };

  const handleDateClick = (day) => {
    if (!isSameMonth(day, currentMonth)) return;
    setSelectedDate(day);
    onSelectAppointmentDate(format(day, 'yyyy-MM-dd'), format(day, 'MMMM d, yyyy'));
    navigate('/appointments');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm h-full flex flex-col justify-between">
      {/* Month Header + Navigation */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>

            {/* Filter Month Appointments Button (Appears when browsing previous/different month) */}
            {!isCurrentRealMonth && (
              <button
                onClick={handleMonthFilterClick}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                title={`View all ${format(currentMonth, 'MMMM yyyy')} appointments`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>View {format(currentMonth, 'MMM')} Appointments</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend: Green Dot ONLY for Appointments */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 p-2 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
          <span className="text-emerald-900 dark:text-emerald-300 font-bold">Scheduled Appointments</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-semibold">
          {days.map((dayItem, idx) => {
            const isCurrent = isSameMonth(dayItem, currentMonth);
            const isSelected = isSameDay(dayItem, selectedDate);
            const isAppointed = hasAppointment(dayItem);

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(dayItem)}
                className={`flex flex-col items-center justify-center h-9 rounded-full cursor-pointer transition-all ${
                  !isCurrent
                    ? 'text-slate-300 dark:text-slate-600 pointer-events-none'
                    : isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{format(dayItem, 'd')}</span>
                {isAppointed && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`}
                    ></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
