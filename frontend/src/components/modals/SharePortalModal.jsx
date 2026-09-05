import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { generateShareLink } from '../../services/api';

export default function SharePortalModal({ patient, onClose = () => {} }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const res = await generateShareLink(patient.id);
      setShareUrl(res.shareUrl);
    } catch (err) {
        setShareUrl('');
        window.alert(err.message || 'Unable to generate the patient portal link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="light-theme-modal fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Patient Portal</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                Patient: {patient?.full_name || 'Patient'} ({patient?.ward_no})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Body */}
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Generate an encrypted token link for <strong className="text-slate-800 dark:text-slate-200">{patient?.full_name}</strong> to view their read-only medical summary and diagnosis records without requiring a full login.
          </p>

          {!shareUrl ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? 'Generating Encrypted Patient Link...' : `Generate Access Link for ${patient?.full_name}`}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open {patient?.full_name}'s Portal Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
