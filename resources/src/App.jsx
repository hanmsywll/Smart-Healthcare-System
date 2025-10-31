import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './views/public/landingPage/page';
import DoctorLayout from './views/doctor/docLayout';
import Dashboard from './views/doctor/dashboard/dashboard';
import Buy from './views/public/landingPage/buy'
import ADashboard from './views/admin/dashboard/dashboard'
import AdminLayout from './views/admin/adminLayout';
import Doctors from './views/admin/doctor/Doctors'
import MedicalRecord from './views/doctor/patients/medicalrecord';
import PublicLayout from './views/public/publicLayout';
import DoctorSchedule from './views/doctor/patients/doctorschedule';
import Department from './views/doctor/patients/department';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route untuk Landing Page (tanpa Sidebar/Header) */}
         <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="buy" element={<Buy />} />
        </Route>

        {/* Grup Route untuk Dokter (semua akan punya Sidebar/Header) */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="medicalrecord" element={<MedicalRecord />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="departments" element={<Department />} />
        </Route>
        
        {/* Anda bisa menambahkan route lain di sini, misal untuk login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
         <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ADashboard />} />
          <Route path="doctors" element={<Doctors />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

///////////////////////////////////////////