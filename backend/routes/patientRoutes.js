const express = require('express');
const router = express.Router();
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { analyzeSymptoms } = require('../services/aiService');
const crypto = require('crypto');

// Initial Mock Patients matching reference UI screenshot
let mockPatients = [
  {
    id: '1',
    full_name: 'Adam Messy',
    gender: 'Male',
    age: 26,
    ward_no: '#123456',
    priority: 'Medium',
    status: 'Active',
    start_date: '2023-06-03',
    end_date: '---',
    phone: '+1 555-0192',
    email: 'adam.messy@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    records: [
      {
        id: 'r1',
        symptoms: 'Mild fever, sore throat, fatigue for 2 days',
        vitals: { bp: '120/80', pulse: 74, temp: '99.1F', spo2: '98%' },
        ai_summary: 'Possible Upper Respiratory Tract Infection (URTI). Recommended rest and fluids.',
        recorded_at: '2023-06-03T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    full_name: 'Celine Aluista',
    gender: 'Female',
    age: 22,
    ward_no: '#985746',
    priority: 'Low',
    status: 'Recovered',
    start_date: '2023-05-31',
    end_date: '2023-06-04',
    phone: '+1 555-0144',
    email: 'celine.a@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    records: []
  },
  {
    id: '3',
    full_name: 'Malachi Ardo',
    gender: 'Male',
    age: 19,
    ward_no: '#047638',
    priority: 'High',
    status: 'Critical',
    start_date: '2023-06-07',
    end_date: '---',
    phone: '+1 555-0188',
    email: 'malachi.ardo@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    records: [
      {
        id: 'r3',
        symptoms: 'High fever, acute abdominal pain in right lower quadrant',
        vitals: { bp: '135/88', pulse: 98, temp: '102.4F', spo2: '96%' },
        ai_summary: 'High probability of Acute Appendicitis. Immediate surgical consult required.',
        recorded_at: '2023-06-07T08:30:00Z'
      }
    ]
  },
  {
    id: '4',
    full_name: 'Mathias Olivera',
    gender: 'Male',
    age: 24,
    ward_no: '#248957',
    priority: 'Medium',
    status: 'Active',
    start_date: '2023-06-01',
    end_date: '2023-06-05',
    phone: '+1 555-0123',
    email: 'mathias.o@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    records: []
  }
];

// Mock Portal Links map (token -> patient_id)
const mockPortalTokens = {};

// GET /api/patients
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').select('*').eq('doctor_id', req.user.id).order('created_at', { ascending: false });
      if (!error && data) {
        return res.json({ success: true, data });
      }
    }
    return res.json({ success: true, data: mockPatients });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').select('*, patient_records(*)').eq('id', id).eq('doctor_id', req.user.id).single();
      if (!error && data) {
        return res.json({ success: true, data });
      }
    }
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    return res.json({ success: true, data: patient });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  const { full_name, gender, age, ward_no, priority, status, phone, email, start_date } = req.body;
  const newPatient = {
    id: Date.now().toString(),
    doctor_id: req.user.id,
    full_name,
    gender: gender || 'Male',
    age: parseInt(age) || 25,
    ward_no: ward_no || `#${Math.floor(100000 + Math.random() * 900000)}`,
    priority: priority || 'Medium',
    status: status || 'Active',
    phone: phone || '',
    email: email || '',
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: '---',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(full_name)}`,
    records: []
  };

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('patients').insert([newPatient]).select().single();
      if (!error && data) return res.status(201).json({ success: true, data });
    }
    mockPatients.unshift(newPatient);
    return res.status(201).json({ success: true, data: newPatient });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients/:id/diagnose-ai
router.post('/:id/diagnose-ai', async (req, res) => {
  const { id } = req.params;
  const { symptoms, vitals, notes, save = true } = req.body;

  let patient = mockPatients.find(p => p.id === id);
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('patients').select('*').eq('id', id).eq('doctor_id', req.user.id).single();
      if (!data) return res.status(404).json({ success: false, error: 'Patient not found or access denied.' });
      patient = data;
  }

  const patientName = patient ? patient.full_name : 'Patient';
  const age = patient ? patient.age : 25;
  const gender = patient ? patient.gender : 'Male';

  try {
    const aiAnalysis = await analyzeSymptoms({ patientName, age, gender, symptoms, vitals });

    const newRecord = {
      patient_id: id,
      doctor_id: req.user.id,
      symptoms,
      vitals: vitals || {},
      notes: notes || '',
      ai_summary: aiAnalysis,
      recorded_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && save) {
      const { error: recordError } = await supabase.from('patient_records').insert([newRecord]);
      if (recordError) return res.status(500).json({ success: false, error: `Consultation could not be saved: ${recordError.message}` });
    }

    if (patient) {
      if (!patient.records) patient.records = [];
      patient.records.unshift(newRecord);
    }

    return res.json({ success: true, record: newRecord });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients/:id/records
router.post('/:id/records', async (req, res) => {
  const { id } = req.params;
  const { symptoms, vitals, notes, ai_summary } = req.body;

  try {
    if (isSupabaseConfigured) {
      const { data: patient } = await supabase.from('patients').select('id').eq('id', id).eq('doctor_id', req.user.id).single();
      if (!patient) return res.status(404).json({ success: false, error: 'Patient not found or access denied.' });

      const { data: record, error } = await supabase.from('patient_records').insert([{
        patient_id: id,
        doctor_id: req.user.id,
        symptoms,
        vitals: vitals || {},
        notes: notes || '',
        ai_summary,
        recorded_at: new Date().toISOString()
      }]).select().single();

      if (error) return res.status(500).json({ success: false, error: `Consultation could not be saved: ${error.message}` });
      return res.status(201).json({ success: true, record });
    }

    return res.status(503).json({ success: false, error: 'Database is not configured.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/patients/:id/share-link
router.post('/:id/share-link', async (req, res) => {
  const { id } = req.params;
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    if (isSupabaseConfigured) {
      const { data: patient } = await supabase.from('patients').select('id').eq('id', id).eq('doctor_id', req.user.id).single();
      if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
      await supabase.from('patient_links').insert([{ patient_id: id, token, expires_at: expiresAt }]);
    } else {
      mockPortalTokens[token] = id;
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/portal/${token}`;
    const clientShareUrl = `http://localhost:5173/portal/${token}`;

    return res.json({
      success: true,
      token,
      expiresAt,
      shareUrl: clientShareUrl
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = {
  router,
  mockPatients,
  mockPortalTokens
};
