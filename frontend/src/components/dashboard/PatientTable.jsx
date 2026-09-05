import React, { useState } from 'react';
import { ChevronDown, Sparkles, Share2, Trash2, Plus } from 'lucide-react';

export default function PatientTable({
  patients = [],
  onOpenAIDiagnosis = () => {},
  onOpenShareModal = () => {},
  onDeletePatient = () => {},
  onOpenAddPatient = () => {},
  onSeeAll = () => {}
}) {
  const [sortOption, setSortOption] = useState('Recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const priorityStyles = {
    Low: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    High: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  const priorityOrder = { High: 3, Medium: 2, Low: 1 };

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortOption === 'Recent') {
      return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
    } else if (sortOption === 'A - Z') {
      return a.full_name.localeCompare(b.full_name);
    } else if (sortOption === 'Z - A') {
      return b.full_name.localeCompare(a.full_name);
    } else if (sortOption === 'Priority High') {
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    } else if (sortOption === 'Priority Low') {
      return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
    }
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Patient</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              This is your several latest patient list
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <span>Sort: {sortOption}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showSortDropdown && (
                <div className="light-theme-menu absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 space-y-1 text-xs">
                  {['Recent', 'A - Z', 'Z - A', 'Priority High', 'Priority Low'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortOption(opt);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors ${
                        sortOption === opt ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Sort: {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* See All Button */}
            <button
              onClick={onSeeAll}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors px-1"
            >
              See All
            </button>

            {/* Add Patient Button */}
            <button
              onClick={onOpenAddPatient}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Ward No.</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Start Date</th>
                <th className="pb-3 font-semibold">End Date</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50 text-xs">
              {sortedPatients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group">
                  {/* Name + Avatar */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.full_name)}`}
                        alt={patient.full_name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {patient.full_name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {patient.gender}, {patient.age} Years
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Ward No */}
                  <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400 font-medium font-mono">
                    {patient.ward_no}
                  </td>

                  {/* Priority Pill */}
                  <td className="py-3.5 px-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${
                        priorityStyles[patient.priority] || priorityStyles.Medium
                      }`}
                    >
                      {patient.priority}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300 font-medium">
                    {patient.start_date}
                  </td>

                  {/* End Date */}
                  <td className="py-3.5 px-2 text-slate-400 dark:text-slate-500 font-medium">
                    {patient.end_date || '---'}
                  </td>

                  {/* Action buttons: AI companion -> Share -> Delete */}
                  <td className="py-3.5 pl-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        title="AI Symptom Diagnosis"
                        onClick={() => onOpenAIDiagnosis(patient)}
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Share Secure Portal Link"
                        onClick={() => onOpenShareModal(patient)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Patient Record"
                        onClick={() => onDeletePatient(patient.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
