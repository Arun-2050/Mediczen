const express = require('express');
const router = express.Router();
const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Mock Schedule Timeline matching reference screenshot
let mockSchedules = [
  {
    id: 's1',
    day: 'Mon',
    title: 'Check up patient',
    start_time: '10:30',
    end_time: '11:45',
    type: 'Checkup',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 's2',
    day: 'Mon',
    title: 'Lunch Break',
    start_time: '12:00',
    end_time: '12:45',
    type: 'Break',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 's3',
    day: 'Mon',
    title: 'Heart Surgery',
    start_time: '13:00',
    end_time: '15:15',
    type: 'Surgery',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 's4',
    day: 'Tue',
    title: 'Check up patient',
    start_time: '10:00',
    end_time: '12:00',
    type: 'Checkup',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 's5',
    day: 'Tue',
    title: 'Lunch Break',
    start_time: '12:15',
    end_time: '13:00',
    type: 'Break',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 's6',
    day: 'Tue',
    title: 'Evaluation',
    start_time: '13:15',
    end_time: '15:30',
    type: 'Evaluation',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
];

// GET /api/schedules
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('schedules').select('*').eq('doctor_id', req.user.id);
      if (!error && data) return res.json({ success: true, data });
    }
    return res.json({ success: true, data: mockSchedules });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/schedules
router.post('/', async (req, res) => {
  const { title, day, start_time, end_time, type } = req.body;
  const newSchedule = {
    id: 's_' + Date.now(),
    doctor_id: req.user.id,
    day: day || 'Mon',
    title,
    start_time,
    end_time,
    type: type || 'Checkup',
    color: type === 'Surgery' ? 'bg-blue-100 text-blue-800 border-blue-300' :
           type === 'Break' ? 'bg-rose-100 text-rose-800 border-rose-300' :
           type === 'Evaluation' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
           'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  try {
    if (isSupabaseConfigured) {
      await supabase.from('schedules').insert([newSchedule]);
    }
    mockSchedules.push(newSchedule);
    return res.status(201).json({ success: true, data: newSchedule });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
