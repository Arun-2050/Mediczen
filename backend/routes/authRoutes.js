const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

const publicSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const provisionDoctor = async (user, details = {}) => {
  const { data: legacyDoctor } = await supabase
    .from('doctors')
    .select('id, email, full_name, specialty, avatar_url')
    .eq('email', user.email)
    .maybeSingle();

  if (legacyDoctor && legacyDoctor.id !== user.id) {
    const { error } = await supabase.from('doctors').update({ email: `legacy-${legacyDoctor.id}@migration.invalid` }).eq('id', legacyDoctor.id);
    if (error) throw error;
  }

  const { data: doctor, error: profileError } = await supabase.from('doctors').insert([{
    id: user.id,
    email: user.email,
    full_name: details.full_name || user.user_metadata?.full_name || 'Dr. Medical',
    specialty: details.specialty || user.user_metadata?.specialty || 'General Medicine',
    avatar_url: details.avatar_url || user.user_metadata?.avatar_url || null
  }]).select().single();
  if (profileError || !doctor) throw profileError || new Error('Could not create doctor profile.');

  if (legacyDoctor && legacyDoctor.id !== user.id) {
    for (const table of ['patients', 'patient_records', 'appointments', 'schedules', 'invoices']) {
      const { error } = await supabase.from(table).update({ doctor_id: user.id }).eq('doctor_id', legacyDoctor.id);
      if (error) throw new Error(`Could not migrate ${table}: ${error.message}`);
    }
    await supabase.from('doctors').delete().eq('id', legacyDoctor.id);
  }
  return doctor;
};

router.post('/register', async (req, res) => {
  const { email, password, full_name, specialty, avatar_url } = req.body;

  if (!isSupabaseConfigured || !supabase) {
    return res.status(503).json({ success: false, error: 'Supabase is not configured.' });
  }
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'A valid email and a password of at least 6 characters are required.' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name, specialty, avatar_url }
    });

    if (authError || !authData.user) {
      return res.status(authError?.status === 422 ? 409 : 400).json({
        success: false,
        error: authError?.message || 'Registration failed.'
      });
    }

    let doctor;
    try {
      doctor = await provisionDoctor(authData.user, { full_name, specialty, avatar_url });
    } catch (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ success: false, error: profileError.message });
    }

    return res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!isSupabaseConfigured || !supabase) {
    return res.status(503).json({ success: false, error: 'Supabase is not configured.' });
  }

  const { data: authData, error: authError } = await publicSupabase.auth.signInWithPassword({
    email: email?.trim().toLowerCase(),
    password
  });
  if (authError || !authData.session || !authData.user) {
    return res.status(401).json({ success: false, error: authError?.message || 'Invalid email or password.' });
  }

  try {
    let { data: doctor } = await supabase.from('doctors').select('*').eq('id', authData.user.id).maybeSingle();
    if (!doctor) doctor = await provisionDoctor(authData.user);
    return res.json({ success: true, data: doctor, session: authData.session });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/provision', async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !supabase) return res.status(401).json({ success: false, error: 'Authentication required.' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ success: false, error: 'Invalid session.' });
  try {
    const doctor = await provisionDoctor(data.user);
    return res.json({ success: true, data: doctor });
  } catch (provisionError) {
    return res.status(400).json({ success: false, error: provisionError.message });
  }
});

module.exports = router;
