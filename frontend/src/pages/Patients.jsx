import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { getPatients, deletePatient, updatePatient } from '../services/api';
import { supabase } from '../services/supabaseClient';
import AIDiagnosisModal from '../components/modals/AIDiagnosisModal';
import SharePortalModal from '../components/modals/SharePortalModal';
import PatientFormModal from '../components/modals/PatientFormModal';
import { Sparkles, Share2, Trash2, Plus, Pencil, X, Check } from 'lucide-react';

const priorityStyles = {
  Low:    'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Medium: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  High:   'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export default function Patients({ doctor = {} }) {
  const [patients, setPatients] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('recent'); // default: recently added
  const [selectedPatientForAI, setSelectedPatientForAI] = useState(null);
  const [selectedPatientForShare, setSelectedPatientForShare] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null); // holds patient being edited
  const [editForm, setEditForm] = useState({});

  const fetchPatients = async () => {
    const data = await getPatients();
    setPatients(data);
  };

  useEffect(() => {
    fetchPatients();

    // Real-time Supabase updates
    const channel = supabase
      .channel('patients-realtime-dir')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchPatients)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleDelete = async (id) => {
    await deletePatient(id);
    await fetchPatients();
  };

  const handleEditOpen = (patient) => {
    setEditingPatient(patient.id);
    setEditForm({
      full_name: patient.full_name,
      gender: patient.gender,
      age: patient.age,
      ward_no: patient.ward_no,
      priority: patient.priority,
      status: patient.status,
      phone: patient.phone || '',
      email: patient.email || '',
      start_date: patient.start_date || '',
      end_date: patient.end_date || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingPatient) return;
    const ageVal = Math.max(0, parseInt(editForm.age) || 0);
    await updatePatient(editingPatient, { ...editForm, age: ageVal });
    setEditingPatient(null);
    await fetchPatients();
  };

  const handleEditCancel = () => {
    setEditingPatient(null);
    setEditForm({});
  };

  // Filter
  let filtered = patients.filter((p) => {
    const matchesSearch =
      (p.full_name || '').toLowerCase().includes(searchVal.toLowerCase()) ||
      (p.ward_no || '').toLowerCase().includes(searchVal.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Sort
  if (sortOrder === 'az') {
    filtered = [...filtered].sort((a, b) => a.full_name.localeCompare(b.full_name));
  } else if (sortOrder === 'za') {
    filtered = [...filtered].sort((a, b) => b.full_name.localeCompare(a.full_name));
  }
  // 'recent' = default order from Supabase (already ordered by created_at desc in API)

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <Header doctor={doctor} searchVal={searchVal} setSearchVal={setSearchVal} />

      <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Patient Directory</h2>
            <p className="text-xs text-slate-400 dark:text-[#52525b] font-medium mt-1">Manage active hospital admissions and clinical diagnosis history</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1c1e26] p-1 rounded-xl">
              {['All', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priorityFilter === p
                      ? 'bg-white dark:bg-[#111318] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-[#71717a] hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-100 dark:bg-[#1c1e26] border border-transparent text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 dark:text-[#52525b] border-b border-slate-100 dark:border-[#1f2028] uppercase tracking-wider">
                <th className="pb-4">Patient Info</th>
                <th className="pb-4">Ward No.</th>
                <th className="pb-4">Priority</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Contact</th>
                <th className="pb-4">Admitted</th>
                <th className="pb-4">End Date</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2028] text-xs">
              {filtered.map((patient) => {
                const isEditing = editingPatient === patient.id;
                return (
                  <tr key={patient.id} className={`hover:bg-slate-50/80 dark:hover:bg-[#16181f] transition-colors ${isEditing ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                    {/* Patient Info */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={patient.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.full_name)}`}
                          alt={patient.full_name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-[#1f2028]"
                        />
                        <div>
                          {isEditing ? (
                            <input
                              value={editForm.full_name}
                              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                              className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white w-32 focus:outline-none"
                            />
                          ) : (
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{patient.full_name}</div>
                          )}
                          {isEditing ? (
                            <div className="flex gap-1 mt-1">
                              <select
                                value={editForm.gender}
                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                className="bg-white dark:bg-[#111318] border border-blue-300 rounded px-1 py-0.5 text-[10px] text-slate-700 dark:text-white"
                              >
                                {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
                              </select>
                              <input
                                type="number"
                                min="0"
                                value={editForm.age}
                                onChange={(e) => setEditForm({ ...editForm, age: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="bg-white dark:bg-[#111318] border border-blue-300 rounded px-1 py-0.5 text-[10px] text-slate-700 dark:text-white w-12"
                              />
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 dark:text-[#52525b] font-medium">{patient.gender}, {patient.age} Years</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ward */}
                    <td className="py-4 px-2 font-mono font-semibold text-slate-600 dark:text-[#a1a1aa]">
                      {isEditing ? (
                        <input
                          value={editForm.ward_no}
                          onChange={(e) => setEditForm({ ...editForm, ward_no: e.target.value })}
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-white w-24 focus:outline-none"
                        />
                      ) : patient.ward_no}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                        >
                          {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${priorityStyles[patient.priority] || priorityStyles.Medium}`}>
                          {patient.priority}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-2 font-bold text-slate-700 dark:text-[#a1a1aa]">
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                        >
                          {['Active', 'Stable', 'Critical', 'Discharged'].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : patient.status}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-2 text-slate-500 dark:text-[#71717a] font-medium">
                      {isEditing ? (
                        <input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="Phone"
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white w-28 focus:outline-none"
                        />
                      ) : (patient.phone || patient.email || 'N/A')}
                    </td>

                    {/* Start Date */}
                    <td className="py-4 px-2 text-slate-500 dark:text-[#71717a] font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.start_date}
                          onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-white w-28 focus:outline-none"
                        />
                      ) : (patient.start_date || '—')}
                    </td>

                    {/* End Date */}
                    <td className="py-4 px-2 text-slate-500 dark:text-[#71717a] font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.end_date}
                          onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                          placeholder="e.g. Jan 15, 2025"
                          className="bg-white dark:bg-[#111318] border border-blue-300 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 dark:text-white w-28 focus:outline-none"
                        />
                      ) : (patient.end_date || '—')}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              title="Save Changes"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-semibold transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleEditCancel}
                              title="Cancel Edit"
                              className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#1c1e26] text-slate-500 dark:text-[#71717a] hover:bg-slate-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* AI Consult */}
                            <button
                              title="AI Symptom Assistant"
                              onClick={() => setSelectedPatientForAI(patient)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI Consult</span>
                            </button>
                            {/* Edit */}
                            <button
                              title="Edit Patient"
                              onClick={() => handleEditOpen(patient)}
                              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {/* Share */}
                            <button
                              title="Share Portal Link"
                              onClick={() => setSelectedPatientForShare(patient)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            {/* Delete */}
                            <button
                              title="Delete Patient Record"
                              onClick={() => handleDelete(patient.id)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 dark:text-[#52525b] italic">
                    No patients found. Register your first patient above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatientForAI && (
        <AIDiagnosisModal patient={selectedPatientForAI} onClose={() => setSelectedPatientForAI(null)} />
      )}
      {selectedPatientForShare && (
        <SharePortalModal patient={selectedPatientForShare} onClose={() => setSelectedPatientForShare(null)} />
      )}
      {isAddOpen && (
        <PatientFormModal onClose={() => setIsAddOpen(false)} onRefresh={fetchPatients} />
      )}
    </div>
  );
}
