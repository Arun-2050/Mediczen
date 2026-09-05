import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { runAIDiagnosis, savePatientRecord } from '../../services/api';

export default function AIDiagnosisModal({ patient, onClose = () => {} }) {
  const [symptoms, setSymptoms] = useState('High fever, sore throat, persistent dry cough, body fatigue for 3 days');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76');
  const [temp, setTemp] = useState('100.4');
  const [spo2, setSpo2] = useState('98');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;
    setLoading(true);
    try {
      const res = await runAIDiagnosis(patient.id, {
        symptoms,
        vitals: { bp, pulse: parseInt(pulse), temp: `${temp}F`, spo2: `${spo2}%` }
      });
      setResult(res.record || null);
      setSaved(false);
    } catch (err) {
      setResult({ failed: true, ai_summary: err.response?.data?.error || err.message || 'Failed to generate the AI consultation.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!patient || !result?.ai_summary || result.failed || saved) return;
    setSaving(true);
    try {
      await savePatientRecord(patient.id, {
        symptoms,
        vitals: result.vitals || { bp, pulse: parseInt(pulse), temp: `${temp}F`, spo2: `${spo2}%` },
        notes: result.notes || '',
        ai_summary: result.ai_summary
      });
      setSaved(true);
    } catch (err) {
      setResult({ ...result, ai_summary: err.message || 'The consultation could not be saved.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Symptom Assistant</h3>
              <p className="text-xs text-slate-400 font-medium">
                Clinical decision support for {patient?.full_name || 'Patient'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reported Symptoms & Notes
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Describe symptoms..."
              required
            />
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pulse (bpm)</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Temp (°F)</label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SpO2 (%)</label>
              <input
                type="text"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Patient Record with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Diagnostic Recommendation</span>
              </>
            )}
          </button>
        </form>

        {/* AI Result Box */}
        {result && (
          <div className="mt-6 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-xs text-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>AI Decision Support Insights</span>
            </div>
            <div className="prose prose-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
              {result.ai_summary}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved || result.failed}
              className={`w-full mt-4 py-3 rounded-xl text-xs font-bold transition-colors ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              {result.failed ? 'Generate a Consultation Before Saving' : saving ? 'Saving Consultation...' : saved ? 'Consultation Saved to Patient Record' : 'Save Consultation to Patient Record'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
