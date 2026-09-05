import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPortalData } from '../services/api';
import { ShieldCheck, Activity, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function PatientPortal() {
  const { token } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const res = await getPortalData(token);
        if (res.patient) {
          setPatient(res.patient);
        } else {
          setError('Invalid or expired token link.');
        }
      } catch (err) {
          setError(err.response?.data?.error || err.message || 'Unable to load this patient portal.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortal();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-semibold text-sm animate-pulse">Loading Patient Medical Portal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-xl">
          <h2 className="text-lg font-bold text-rose-600 mb-2">Access Error</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mediczen™ Patient Portal</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Encrypted Read-Only Medical Record</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Access</span>
          </div>
        </div>

        {/* Patient Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.full_name)}`}
              alt={patient.full_name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50"
            />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{patient.full_name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                <span>{patient.gender}, {patient.age} Years</span>
                <span>•</span>
                <span>Ward No: <strong className="font-mono text-slate-800">{patient.ward_no}</strong></span>
                <span>•</span>
                <span className="text-blue-600 font-bold">{patient.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Admission Date</span>
              <p className="font-bold text-slate-800 mt-0.5">{patient.start_date}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Priority Level</span>
              <p className="font-bold text-slate-800 mt-0.5">{patient.priority}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Attending Doctor</span>
              <p className="font-bold text-slate-800 mt-0.5">Dr. Andreas</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Hospital Department</span>
              <p className="font-bold text-slate-800 mt-0.5">General Ward</p>
            </div>
          </div>
        </div>

        {/* Clinical Notes & AI Summaries */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Diagnostic & Treatment Records</span>
          </div>

          {patient.records && patient.records.length > 0 ? (
            patient.records.map((rec) => (
              <div key={rec.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Record Date: {new Date(rec.recorded_at).toLocaleDateString()}</span>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px]">Clinical Entry</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Symptoms Reported</h4>
                  <p className="text-xs text-slate-800 font-medium mt-1">{rec.symptoms}</p>
                </div>
                {rec.ai_summary && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Doctor Assessment & Guidelines</span>
                    </h4>
                    <div className="whitespace-pre-line text-slate-700 font-sans leading-relaxed">
                      {rec.ai_summary}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No diagnostic entries recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
