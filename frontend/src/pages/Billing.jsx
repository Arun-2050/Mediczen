import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { getInvoices, createInvoice, deleteInvoice, updateInvoice } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Receipt, Plus, X, Loader2, Trash2, Search, Pencil } from 'lucide-react';

export default function Billing({ doctor = {} }) {
  const [invoices, setInvoices] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [wardNo, setWardNo] = useState('#123456');
  const [description, setDescription] = useState('Doctor Clinical Consultation Fee');
  const [amount, setAmount] = useState('250.00');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const fetchInvoices = async () => {
    const data = await getInvoices();
    setInvoices(data);
  };

  useEffect(() => {
    fetchInvoices();

    // Real-time Supabase updates
    const channel = supabase
      .channel('invoices-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, fetchInvoices)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleDeleteInvoice = async (id) => {
    await deleteInvoice(id);
    await fetchInvoices();
  };

  const openEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setPatientName(invoice.patient_name || '');
    setWardNo(invoice.ward_no || '');
    setDescription(invoice.items?.[0]?.description || 'Medical Service');
    setAmount(String(invoice.total_amount || '0'));
    setIssuedDate(invoice.issued_date || new Date().toISOString().split('T')[0]);
    setDueDate(invoice.due_date || new Date().toISOString().split('T')[0]);
    setStatus(invoice.status || 'Pending');
    setIsCreateOpen(true);
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        patient_name: patientName,
        ward_no: wardNo,
        items: [{ description, qty: 1, price: parseFloat(amount) }],
        total_amount: parseFloat(amount),
        issued_date: issuedDate,
        due_date: dueDate,
        status
      };
      if (editingInvoice) await updateInvoice(editingInvoice.id, payload);
      else await createInvoice({ ...payload, status: 'Pending' });
      await fetchInvoices();
      setIsCreateOpen(false);
      setEditingInvoice(null);
      setPatientName('');
    } finally {
      setLoading(false);
    }
  };

  // Working search: filter by patient name OR invoice id
  const filtered = invoices.filter((inv) => {
    const q = searchVal.toLowerCase().trim();
    if (!q) return true;
    return (
      (inv.patient_name || '').toLowerCase().includes(q) ||
      (inv.id || '').toLowerCase().includes(q) ||
      (inv.ward_no || '').toLowerCase().includes(q) ||
      (inv.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="light-theme-page p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <Header doctor={doctor} searchVal={searchVal} setSearchVal={setSearchVal} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Billing & Invoices</h2>
          <p className="text-xs text-slate-500 dark:text-[#71717a] font-medium mt-1">Hospital treatment invoices and patient payment tracking</p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setPatientName('');
            setWardNo('#123456');
            setDescription('Doctor Clinical Consultation Fee');
            setAmount('250.00');
            setIssuedDate(new Date().toISOString().split('T')[0]);
            setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            setStatus('Pending');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Search within billing */}
      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient name, status..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1f2028] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-[#e4e4e7] placeholder-slate-400 dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 dark:text-[#52525b] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-[#1f2028]">
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Patient Name</th>
                <th className="pb-3">Ward No.</th>
                <th className="pb-3">Issued Date</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2028] font-medium text-slate-700 dark:text-[#a1a1aa]">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-[#16181f] transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">{inv.id.substring(0, 8)}</td>
                  <td className="py-4 font-bold text-slate-900 dark:text-white">{inv.patient_name}</td>
                  <td className="py-4 font-mono text-slate-500 dark:text-[#71717a]">{inv.ward_no}</td>
                  <td className="py-4">{inv.issued_date}</td>
                  <td className="py-4">{inv.due_date}</td>
                  <td className="py-4 font-extrabold text-slate-900 dark:text-white">${parseFloat(inv.total_amount || 0).toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditInvoice(inv)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors" title="Edit Invoice">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 dark:text-[#52525b] italic">
                    {searchVal ? `No invoices matching "${searchVal}"` : 'No invoices found. Create your first invoice above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-[#1f2028] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1f2028]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingInvoice ? 'Edit Patient Invoice' : 'Create Patient Invoice'}</h3>
                  <p className="text-xs text-slate-400 dark:text-[#71717a] font-medium">Generate medical bill saved to Supabase</p>
                </div>
              </div>
              <button onClick={() => { setIsCreateOpen(false); setEditingInvoice(null); }} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Adam Messy"
                  className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Ward No.</label>
                  <input
                    type="text"
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Issued Date</label>
                  <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-medium">
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-[#a1a1aa] uppercase mb-1">Medical Item Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#16181f] border border-slate-200 dark:border-[#1f2028] rounded-xl p-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingInvoice ? 'Save Invoice Changes' : 'Generate & Save Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
