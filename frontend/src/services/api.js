import { supabase } from './supabaseClient';
import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE_URL = configuredApiUrl === '/api' || configuredApiUrl.endsWith('/api')
  ? configuredApiUrl.replace(/\/$/, '')
  : `${configuredApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCurrentDoctorId = () => {
  try {
    return JSON.parse(localStorage.getItem('mediczen_doctor') || 'null')?.id || null;
  } catch {
    return null;
  }
};

const requireDoctorId = () => {
  const doctorId = getCurrentDoctorId();
  if (!doctorId) throw new Error('You must be signed in to access clinical data.');
  return doctorId;
};

// --- DOCTOR AUTHENTICATION ---
export const loginDoctor = async ({ email, password }) => {
  let response;
  try {
    response = await api.post('/auth/login', { email, password });
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
  if (!response.data?.success || !response.data.session) {
    throw new Error(response.data?.error || 'Invalid email or password credentials.');
  }

  const { error: sessionError } = await supabase.auth.setSession(response.data.session);
  if (sessionError) throw new Error(sessionError.message);
  return response.data.data;
};

export const registerDoctor = async ({ email, password, full_name, specialty, avatar_url }) => {
  let response;
  try {
    response = await api.post('/auth/register', { email, password, full_name, specialty, avatar_url });
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
  if (!response.data?.success) throw new Error(response.data?.error || 'Registration failed.');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (authError || !authData.user) throw new Error(authError?.message || 'Account created, but sign in failed.');
  return response.data.data;
};

export const updateDoctorProfile = async (doctorId, updates) => {
  try {
    const { data, error } = await supabase.from('doctors').update(updates).eq('id', doctorId).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Failed to update doctor profile:', err);
  }
  return updates;
};

export const updateDoctorActiveTime = async (doctorId, sessionSeconds) => {
  if (!doctorId) return;
  try {
    const { data: currDoc } = await supabase.from('doctors').select('active_seconds').eq('id', doctorId).single();
    const currTotal = currDoc ? (currDoc.active_seconds || 0) : 0;
    const newTotal = currTotal + sessionSeconds;
    await supabase.from('doctors').update({ active_seconds: newTotal }).eq('id', doctorId);
  } catch (err) {
    console.error('Failed to save session active time:', err);
  }
};

// --- STATIC HOSPITAL RESOURCE & HELP CENTER API ---
export const getHospitalStats = async () => {
  try {
    const { data, error } = await supabase.from('hospital').select('*').eq('id', 1).single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('Failed to fetch hospital stats:', err.message);
  }
  return {
    id: 1,
    hospital_name: 'Mediczen Central Hospital',
    address: '104 Healthcare Boulevard, Medical District',
    hotline: '+1 (800) 555-MEDIC',
    email: 'contact@mediczen.org',
    available_beds: 86,
    available_doctors: 126,
    available_ambulances: 32
  };
};

export const updateHospitalRegistry = async ({ masterKey, address, hotline, email }) => {
  if (masterKey !== '@admin7') throw new Error('Invalid master key.');
  const { data, error } = await supabase
    .from('hospital')
    .update({ address, hotline, email })
    .eq('id', 1)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const requestHospitalResources = async ({ doctorId, doctorName, resourceType, quantity, notes }) => {
  try {
    await supabase.from('help_requests').insert([{
      doctor_id: doctorId,
      doctor_name: doctorName,
      resource_type: resourceType,
      quantity: parseInt(quantity),
      notes
    }]);

    const { data: curr } = await supabase.from('hospital').select('*').eq('id', 1).single();
    if (curr) {
      const fieldMap = {
        beds: 'available_beds',
        doctors: 'available_doctors',
        ambulances: 'available_ambulances'
      };
      const targetField = fieldMap[resourceType];
      const newCount = (curr[targetField] || 0) + parseInt(quantity);
      
      const { data: updated } = await supabase
        .from('hospital')
        .update({ [targetField]: newCount })
        .eq('id', 1)
        .select()
        .single();

      return updated;
    }
  } catch (err) {
    console.error('Error demanding hospital resources:', err);
  }
};

// --- PATIENTS API ---
export const getPatients = async () => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase
      .from('patients')
      .select('*, patient_records(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {
    console.warn('Fallback for patients:', err.message);
  }
  return [];
};

export const createPatient = async (patientData) => {
  const doctorId = requireDoctorId();
  const newPatient = {
    id: crypto.randomUUID(),
    doctor_id: doctorId,
    full_name: patientData.full_name,
    gender: patientData.gender || 'Male',
    age: Math.max(0, parseInt(patientData.age) || 25),
    ward_no: patientData.ward_no || `#${Math.floor(100000 + Math.random() * 900000)}`,
    priority: patientData.priority || 'Medium',
    status: patientData.status || 'Active',
    phone: patientData.phone || '',
    email: patientData.email || '',
    start_date: patientData.start_date || new Date().toISOString().split('T')[0],
    end_date: patientData.end_date || null,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patientData.full_name)}`
  };

  try {
    const { data, error } = await supabase.from('patients').insert([newPatient]).select().single();
    
    if (patientData.appointment_date) {
      await createAppointment({
        patient_id: newPatient.id,
        patient_name: newPatient.full_name,
        appointment_date: patientData.appointment_date,
        start_time: patientData.appointment_time || '10:00 AM',
        reason: patientData.reason || 'Initial Intake & Consultation'
      });
    }

    if (!error && data) return data;
  } catch (err) {
    console.error('Supabase create patient error:', err);
  }
  return newPatient;
};

export const updatePatient = async (patientId, updates) => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase.from('patients').update(updates).eq('id', patientId).eq('doctor_id', doctorId).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Update patient error:', err);
  }
  return updates;
};

export const deletePatient = async (patientId) => {
  try {
    const doctorId = requireDoctorId();
    await supabase.from('patients').delete().eq('id', patientId).eq('doctor_id', doctorId);
    return true;
  } catch (err) {
    console.error('Delete patient error:', err);
    return false;
  }
};

// --- APPOINTMENTS API ---
export const getAppointments = async () => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: true });

    if (!error && data) return data;
  } catch (err) {
    console.warn('Appointments fetch fallback:', err.message);
  }
  return [];
};

export const createAppointment = async (appointmentData) => {
  const doctorId = requireDoctorId();
  const newAppointment = {
    id: crypto.randomUUID(),
    doctor_id: doctorId,
    patient_id: appointmentData.patient_id || null,
    patient_name: appointmentData.patient_name || 'Patient',
    appointment_date: appointmentData.appointment_date || new Date().toISOString().split('T')[0],
    start_time: appointmentData.start_time || '10:00 AM',
    reason: appointmentData.reason || 'General Consultation',
    status: 'Scheduled'
  };

  try {
    const { data, error } = await supabase.from('appointments').insert([newAppointment]).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Create appointment error:', err);
  }
  return newAppointment;
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const doctorId = requireDoctorId();
    await supabase.from('appointments').delete().eq('id', appointmentId).eq('doctor_id', doctorId);
    return true;
  } catch (err) {
    console.error('Delete appointment error:', err);
    return false;
  }
};

// --- SCHEDULES API ---
export const getSchedules = async () => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase.from('schedules').select('*').eq('doctor_id', doctorId).order('start_time', { ascending: true });
    if (!error && data) return data;
  } catch (err) {
    console.warn('Schedules fetch fallback:', err.message);
  }
  return [];
};

export const createSchedule = async (scheduleData) => {
  const doctorId = requireDoctorId();
  const newSchedule = {
    id: crypto.randomUUID(),
    doctor_id: doctorId,
    title: scheduleData.title || 'Clinical Task',
    schedule_date: scheduleData.schedule_date || new Date().toISOString().split('T')[0],
    start_time: scheduleData.start_time || '10:00',
    end_time: scheduleData.end_time || '11:00',
    type: scheduleData.type || 'Checkup'
  };

  try {
    const { data, error } = await supabase.from('schedules').insert([newSchedule]).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Create schedule error:', err);
  }
  return newSchedule;
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const doctorId = requireDoctorId();
    await supabase.from('schedules').delete().eq('id', scheduleId).eq('doctor_id', doctorId);
    return true;
  } catch (err) {
    console.error('Delete schedule error:', err);
    return false;
  }
};

// --- INVOICES / BILLING API ---
export const getInvoices = async () => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase.from('invoices').select('*').eq('doctor_id', doctorId).order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('Invoices fetch fallback:', err.message);
  }
  return [];
};

export const createInvoice = async (invoiceData) => {
  const doctorId = requireDoctorId();
  const newInvoice = {
    id: crypto.randomUUID(),
    doctor_id: doctorId,
    patient_name: invoiceData.patient_name || 'Patient',
    ward_no: invoiceData.ward_no || '#101010',
    items: invoiceData.items || [{ description: 'General Consultation', qty: 1, price: 150 }],
    total_amount: parseFloat(invoiceData.total_amount) || 150.00,
    status: invoiceData.status || 'Pending',
    issued_date: invoiceData.issued_date || new Date().toISOString().split('T')[0],
    due_date: invoiceData.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  try {
    const { data, error } = await supabase.from('invoices').insert([newInvoice]).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Create invoice error:', err);
  }
  return newInvoice;
};

export const deleteInvoice = async (invoiceId) => {
  try {
    const doctorId = requireDoctorId();
    await supabase.from('invoices').delete().eq('id', invoiceId).eq('doctor_id', doctorId);
    return true;
  } catch (err) {
    console.error('Delete invoice error:', err);
    return false;
  }
};

export const updateInvoice = async (invoiceId, updates) => {
  try {
    const doctorId = requireDoctorId();
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .eq('doctor_id', doctorId)
      .select()
      .single();
    if (!error && data) return data;
  } catch (err) {
    console.error('Update invoice error:', err);
  }
  return updates;
};

// --- AI DIAGNOSIS & SHARE PORTAL ---
export const runAIDiagnosis = async (patientId, payload) => {

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your session has expired. Please sign in again.');

  const response = await api.post(`/patients/${patientId}/diagnose-ai`, { ...payload, save: false }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.data?.success || !response.data.record) {
    throw new Error(response.data?.error || 'The AI consultation could not be generated.');
  }
  return response.data;
};

export const savePatientRecord = async (patientId, record) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your session has expired. Please sign in again.');

  const response = await api.post(`/patients/${patientId}/records`, record, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.data?.success || !response.data.record) {
    throw new Error(response.data?.error || 'The consultation could not be saved.');
  }
  return response.data.record;
};

export const generateShareLink = async (patientId) => {
  const doctorId = requireDoctorId();
  const token = `token_${patientId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: patient } = await supabase.from('patients').select('id').eq('id', patientId).eq('doctor_id', doctorId).single();
  if (!patient) throw new Error('Patient not found or access denied.');
  const { error } = await supabase.from('patient_links').insert([{ patient_id: patientId, token, expires_at: expiresAt }]);
  if (error) throw new Error(`Could not create portal link: ${error.message}`);

  return {
    success: true,
    token,
    shareUrl: `${window.location.origin}/portal/${token}`
  };
};

export const getPortalData = async (token) => {
  try {
    const response = await api.get(`/portal/${encodeURIComponent(token)}`);
    if (response.data?.success) return response.data;

  } catch (err) {
    console.warn('Portal lookup fallback:', err.message);
  }
  return { success: false, error: 'Patient portal record not found.' };
};

export default api;
