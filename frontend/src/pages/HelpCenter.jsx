import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getHospitalStats, requestHospitalResources } from '../services/api';
import { PhoneCall, Mail, MapPin, Building2, PlusCircle, Check, Bed, Stethoscope, Truck, Loader2 } from 'lucide-react';

export default function HelpCenter({ doctor = {}, onHospitalUpdate = () => {} }) {
  const location = useLocation();
  const preselected = location.state?.preselectResource || 'beds';

  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [resourceType, setResourceType] = useState(preselected);
  const [quantity, setQuantity] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state?.preselectResource) {
      setResourceType(location.state.preselectResource);
    }
  }, [location.state]);

  const fetchInfo = async () => {
    const data = await getHospitalStats();
    setHospitalInfo(data);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleResourceDemand = async (e) => {
    e.preventDefault();
    if (!quantity) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      const updated = await requestHospitalResources({
        doctorId: doctor.id,
        doctorName: doctor.full_name || 'Dr. Medical',
        resourceType,
        quantity: parseInt(quantity),
        notes
      });
      if (updated) {
        setHospitalInfo(updated);
        onHospitalUpdate(updated);
      } else {
        fetchInfo();
      }
      setSuccessMsg(`Successfully submitted demand for +${quantity} ${resourceType}! Hospital static table in Supabase updated live.`);
      setQuantity(5);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-theme-page p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header (Search bar hidden automatically via location.pathname === '/help') */}
      <Header doctor={doctor} />

      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hospital Support & Help Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Access hospital contact information and submit resource allocation demands for beds, doctors, and ambulances.
          </p>
        </div>

        {/* Hospital Contact Details Card (Common Static Supabase Data) */}
        <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1f2028] pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{hospitalInfo?.hospital_name || 'Mediczen Central Hospital'}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Common Static Hospital Registry (Shared Database)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Hospital Address</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{hospitalInfo?.address || '104 Healthcare Blvd'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Emergency Hotline</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{hospitalInfo?.hotline || '+1 (800) 555-MEDIC'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Hospital Email</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">{hospitalInfo?.email || 'contact@mediczen.org'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demand Resource Allocation Form */}
        <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-[#1f2028] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital Resource Demand Form</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              Apply for additional beds, doctors, or ambulances. Submitting this form updates the static <span className="font-mono text-slate-700 dark:text-slate-300">hospital</span> table in Supabase and increases the dashboard stat counts in real time!
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleResourceDemand} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Resource Type to Demand</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beds', label: 'Beds', icon: Bed },
                    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
                    { id: 'ambulances', label: 'Ambulance', icon: Truck }
                  ].map((res) => {
                    const Icon = res.icon;
                    const isSel = resourceType === res.id;
                    return (
                      <button
                        type="button"
                        key={res.id}
                        onClick={() => setResourceType(res.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                          isSel
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span>{res.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Requested Quantity Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Reason / Clinical Notes for Hospital Management</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Urgent demand due to seasonal surge in ICU admissions..."
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Supabase Hospital Table...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Demand & Update Dashboard Real-Time</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
