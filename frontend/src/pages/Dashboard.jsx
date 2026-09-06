import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import StatCards from '../components/dashboard/StatCards';
import PatientTable from '../components/dashboard/PatientTable';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import ScheduleTimeline from '../components/dashboard/ScheduleTimeline';
import AIDiagnosisModal from '../components/modals/AIDiagnosisModal';
import SharePortalModal from '../components/modals/SharePortalModal';
import PatientFormModal from '../components/modals/PatientFormModal';
import { getPatients, getSchedules, getAppointments, getHospitalStats, deletePatient, deleteSchedule } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({
  doctor = {},
  activeSeconds = 22960,
  onLogout = () => {},
  onSelectMonthFilter = () => {},
  onSelectAppointmentDate = () => {},
  hasUnreadAppointments = false,
  setHasUnreadAppointments = () => {}
}) {
  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState({ available_beds: 86, available_doctors: 126, available_ambulances: 32 });
  const [searchVal, setSearchVal] = useState('');
  const [selectedPatientForAI, setSelectedPatientForAI] = useState(null);
  const [selectedPatientForShare, setSelectedPatientForShare] = useState(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    const patData = await getPatients();
    setPatients(patData);

    const schedData = await getSchedules();
    setSchedules(schedData);

    const aptData = await getAppointments();
    setAppointments(aptData);

    const hospData = await getHospitalStats();
    setHospitalInfo(hospData);
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time Supabase listener
    const channel = supabase
      .channel('schema-db-dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospital' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        fetchDashboardData();
        if (payload.eventType === 'INSERT') {
          setHasUnreadAppointments(true);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeletePatient = async (id) => {
    await deletePatient(id);
    await fetchDashboardData();
  };

  const handleDeleteSchedule = async (id) => {
    const deleted = await deleteSchedule(id);
    if (deleted) await fetchDashboardData();
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.ward_no.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header */}
      <Header
        doctor={doctor}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        activeSeconds={activeSeconds}
        onLogout={onLogout}
        hasUnreadAppointments={hasUnreadAppointments}
        setHasUnreadAppointments={setHasUnreadAppointments}
      />

      {/* Top KPI Stat Cards */}
      <StatCards
        availableBeds={hospitalInfo.available_beds}
        availableDoctors={hospitalInfo.available_doctors}
        availableAmbulances={hospitalInfo.available_ambulances}
      />

      {/* Middle Section: Latest Patient List + Calendar Widget side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2">
          <PatientTable
            patients={filteredPatients}
            onOpenAIDiagnosis={(patient) => setSelectedPatientForAI(patient)}
            onOpenShareModal={(patient) => setSelectedPatientForShare(patient)}
            onDeletePatient={handleDeletePatient}
            onOpenAddPatient={() => setIsAddPatientOpen(true)}
            onSeeAll={() => navigate('/patients')}
          />
        </div>
        <div className="lg:col-span-1">
          <CalendarWidget
            appointments={appointments}
            onSelectMonthFilter={onSelectMonthFilter}
            onSelectAppointmentDate={onSelectAppointmentDate}
          />
        </div>
      </div>

      {/* Bottom Section: Schedule Timeline */}
      <ScheduleTimeline schedules={schedules} onDeleteSchedule={handleDeleteSchedule} />

      {/* Modals */}
      {selectedPatientForAI && (
        <AIDiagnosisModal
          patient={selectedPatientForAI}
          onClose={() => setSelectedPatientForAI(null)}
        />
      )}

      {selectedPatientForShare && (
        <SharePortalModal
          patient={selectedPatientForShare}
          onClose={() => setSelectedPatientForShare(null)}
        />
      )}

      {isAddPatientOpen && (
        <PatientFormModal
          onClose={() => setIsAddPatientOpen(false)}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}
