const express = require('express');
const router = express.Router();
const { supabase, isSupabaseConfigured } = require('../config/supabase');

let mockAppointments = [
  {
    id: 'a1',
    patient_name: 'Adam Messy',
    appointment_date: '2023-06-08',
    time: '09:30 AM',
    reason: 'Routine Post-Op Checkup',
    status: 'Scheduled'
  },
  {
    id: 'a2',
    patient_name: 'Celine Aluista',
    appointment_date: '2023-06-08',
    time: '11:00 AM',
    reason: 'Blood Test Results Review',
    status: 'Scheduled'
  },
  {
    id: 'a3',
    patient_name: 'Mathias Olivera',
    appointment_date: '2023-06-08',
    time: '02:15 PM',
    reason: 'Physical Therapy Assessment',
    status: 'Scheduled'
  }
];

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('appointments').select('*').eq('doctor_id', req.user.id);
      if (!error && data) return res.json({ success: true, data });
    }
    return res.json({ success: true, data: mockAppointments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const { patient_name, appointment_date, time, reason } = req.body;
  const newAppointment = {
    id: 'apt_' + Date.now(),
    doctor_id: req.user.id,
    patient_name,
    appointment_date: appointment_date || new Date().toISOString().split('T')[0],
    time: time || '10:00 AM',
    reason: reason || 'General Consultation',
    status: 'Scheduled'
  };

  try {
    if (isSupabaseConfigured) {
      await supabase.from('appointments').insert([newAppointment]);
    }
    mockAppointments.unshift(newAppointment);
    return res.status(201).json({ success: true, data: newAppointment });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
