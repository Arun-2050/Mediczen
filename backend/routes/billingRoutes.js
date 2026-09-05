const express = require('express');
const router = express.Router();
const { supabase, isSupabaseConfigured } = require('../config/supabase');

let mockInvoices = [
  {
    id: 'inv_101',
    patient_name: 'Adam Messy',
    ward_no: '#123456',
    issued_date: '2023-06-03',
    due_date: '2023-06-17',
    total_amount: 350.00,
    status: 'Paid',
    items: [
      { description: 'General Doctor Consultation', qty: 1, price: 150 },
      { description: 'Laboratory Blood Diagnostics', qty: 1, price: 200 }
    ]
  },
  {
    id: 'inv_102',
    patient_name: 'Malachi Ardo',
    ward_no: '#047638',
    issued_date: '2023-06-07',
    due_date: '2023-06-21',
    total_amount: 1420.00,
    status: 'Pending',
    items: [
      { description: 'Emergency Room Admission', qty: 1, price: 500 },
      { description: 'Abdominal Ultrasound Scan', qty: 1, price: 420 },
      { description: 'Surgical Consultation', qty: 1, price: 500 }
    ]
  }
];

// GET /api/invoices
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('invoices').select('*').eq('doctor_id', req.user.id);
      if (!error && data) return res.json({ success: true, data });
    }
    return res.json({ success: true, data: mockInvoices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices
router.post('/', async (req, res) => {
  const { patient_name, ward_no, items, total_amount } = req.body;
  const newInvoice = {
    id: 'inv_' + Date.now(),
    doctor_id: req.user.id,
    patient_name: patient_name || 'Patient',
    ward_no: ward_no || '#000000',
    issued_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: parseFloat(total_amount) || 250.00,
    status: 'Pending',
    items: items || [{ description: 'Medical Service', qty: 1, price: 250 }]
  };

  try {
    if (isSupabaseConfigured) {
      await supabase.from('invoices').insert([newInvoice]);
    }
    mockInvoices.unshift(newInvoice);
    return res.status(201).json({ success: true, data: newInvoice });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
