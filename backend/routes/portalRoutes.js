const express = require('express');
const router = express.Router();
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { mockPatients, mockPortalTokens } = require('./patientRoutes');

// GET /api/portal/:token
router.get('/:token', async (req, res) => {
  const { token } = req.params;

  try {
    if (isSupabaseConfigured) {
      const { data: linkData, error: linkErr } = await supabase
        .from('patient_links')
        .select('patient_id, expires_at')
        .eq('token', token)
        .single();

      if (linkErr || !linkData) {
        return res.status(404).json({ success: false, error: 'This portal link was not found. Generate a new link from the patient profile.' });
      }

      if (new Date(linkData.expires_at) < new Date()) {
        return res.status(410).json({ success: false, error: 'This access link has expired. Generate a new link from the patient profile.' });
      }

      const { data: patient, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('id', linkData.patient_id)
        .single();
      if (patientErr || !patient) {
        return res.status(404).json({ success: false, error: `Patient record could not be loaded: ${patientErr?.message || 'not found'}` });
      }

      const { data: records, error: recordsErr } = await supabase
        .from('patient_records')
        .select('*')
        .eq('patient_id', linkData.patient_id)
        .order('recorded_at', { ascending: false });
      if (recordsErr) {
        return res.status(500).json({ success: false, error: `Diagnostic records could not be loaded: ${recordsErr.message}` });
      }

      return res.json({ success: true, patient: { ...patient, records: records || [] } });
    }

    // Fallback check
    const patientId = mockPortalTokens[token];
    if (!patientId) {
      return res.status(404).json({ success: false, error: 'Invalid or expired portal access token.' });
    }
    const patient = mockPatients.find(p => p.id === patientId);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Invalid or expired portal access token.' });
    }

    return res.json({
      success: true,
      patient: {
        id: patient.id,
        full_name: patient.full_name,
        gender: patient.gender,
        age: patient.age,
        ward_no: patient.ward_no,
        priority: patient.priority,
        status: patient.status,
        start_date: patient.start_date,
        records: patient.records || []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
