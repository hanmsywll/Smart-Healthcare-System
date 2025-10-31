import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { 
  getActor, 
  getPrincipal, 
  isAuthenticated
} from '../../../service/auth';
import { Principal } from '@dfinity/principal';

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, hospital, onToggleStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggleStatus(doctor.id);
    setIsLoading(false);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              {doctor.photoURL ? (
                <img 
                  src={doctor.photoURL} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              doctor.isActive ? 'bg-green-400' : 'bg-red-400'
            }`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{doctor.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {doctor.specialty}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`p-2 rounded-xl transition-all duration-200 ${
            doctor.isActive 
              ? 'bg-green-50 text-green-600 hover:bg-green-100' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : doctor.isActive ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <XCircleIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600">
          <BuildingOfficeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{hospital?.name || 'Unknown Hospital'}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            doctor.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {doctor.isActive ? 'Active' : 'Inactive'}
          </div>
          
          <div className="text-xs text-gray-400 font-mono">
            ID: {doctor.id}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Doctor Form Component
const AddDoctorForm = ({ onBack, onSave, hospitals, userHospitals, isSubmitting, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hospitalId: '',
    photoURL: '',
    walletAddress: ''
  });
  const [errors, setErrors] = useState({});

  const specialties = [
    'Cardiologist', 'Neurologist', 'Pediatrician', 'Dermatologist', 
    'Orthopedist', 'Gynecologist', 'Psychiatrist', 'Radiologist',
    'Anesthesiologist', 'Pathologist', 'Surgeon', 'Internal Medicine'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.specialty) newErrors.specialty = 'Specialty is required';
    if (!formData.hospitalId) newErrors.hospitalId = 'Hospital is required';
    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Principal ID is required';
    } else {
      try {
        Principal.fromText(formData.walletAddress);
      } catch {
        newErrors.walletAddress = 'Invalid Principal ID format';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave({
      ...formData,
      hospitalId: Number(formData.hospitalId)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
        >
          ← Back to Doctors
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
            <p className="text-gray-600 mt-1">Register a new doctor to the blockchain</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Doctor Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter doctor's full name"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Specialty *
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all ${
                  errors.specialty ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              {errors.specialty && <p className="mt-2 text-sm text-red-600">{errors.specialty}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Hospital *
              </label>
              <select
                value={formData.hospitalId}
                onChange={(e) => handleInputChange('hospitalId', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all ${
                  errors.hospitalId ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select hospital</option>
                {userHospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
              {errors.hospitalId && <p className="mt-2 text-sm text-red-600">{errors.hospitalId}</p>}
              <p className="text-xs text-gray-500 mt-2">Only your hospitals are shown</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Principal ID *
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all font-mono text-sm ${
                  errors.walletAddress ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter doctor's Principal ID"
              />
              {errors.walletAddress && <p className="mt-2 text-sm text-red-600">{errors.walletAddress}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.photoURL}
                onChange={(e) => handleInputChange('photoURL', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            {formData.photoURL && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Photo Preview
                </label>
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={formData.photoURL}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Registering...
              </div>
            ) : (
              'Register Doctor'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Doctors Component
const Doctors = () => {
  const [currentView, setCurrentView] = useState('list');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [userHospitals, setUserHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Get auth state from Header component's getPrincipal
  const principal = getPrincipal();
  const authenticated = isAuthenticated();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const actor = getActor();
      if (!actor) {
        setError('Unable to connect to blockchain. Please check your connection.');
        return;
      }

      const [doctorsResult, hospitalsResult] = await Promise.all([
        actor.getDoctorsByPrincipal(),
        actor.getHospitalsByPrincipal()
      ]);
      
      const normalizedHospitals = hospitalsResult.map(hospital => ({
        ...hospital,
        id: Number(hospital.id)
      }));
      
      const normalizedDoctors = doctorsResult.map(doctor => ({
        ...doctor,
        id: Number(doctor.id),
        hospitalId: Number(doctor.hospitalId)
      }));
      
      // Filter user hospitals
      const ownedHospitals = normalizedHospitals.filter(hospital => 
        hospital.walletAddress.toString().toLowerCase() === principal?.toLowerCase()
      );
      
      setDoctors(normalizedDoctors);
      setHospitals(normalizedHospitals);
      setUserHospitals(ownedHospitals);
      setError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data from blockchain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDoctor = async (doctorData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const actor = getActor();
      if (!actor) {
        throw new Error('Unable to connect to blockchain');
      }

      const doctorPrincipal = Principal.fromText(doctorData.walletAddress);
      const result = await actor.registerDoctor(
        doctorData.hospitalId,
        doctorData.name,
        doctorData.specialty,
        doctorData.photoURL,
        doctorPrincipal
      );
      
      if (result.includes('Unauthorized')) {
        setError(result);
      } else {
        await loadData();
        setCurrentView('list');
        // Could add toast notification here
      }
    } catch (err) {
      console.error('Doctor registration failed:', err);
      setError(`Registration failed: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId) => {
    try {
      const actor = getActor();
      if (!actor) {
        setError('Unable to connect to blockchain');
        return;
      }

      const result = await actor.deactivateDoctor(doctorId);
      if (result.includes('Unauthorized')) {
        setError(result);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to toggle doctor status:', err);
      setError('Failed to update doctor status. Please try again.');
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = !filterHospital || doctor.hospitalId === Number(filterHospital);
    const matchesStatus = !filterStatus || doctor.isActive.toString() === filterStatus;
    return matchesSearch && matchesHospital && matchesStatus;
  });

  const activeDoctors = doctors.filter(d => d.isActive).length;
  const totalHospitals = hospitals.length;
  const myHospitals = userHospitals.length;

  if (currentView === 'add') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AddDoctorForm 
          onBack={() => setCurrentView('list')}
          onSave={handleSaveDoctor}
          hospitals={hospitals}
          userHospitals={userHospitals}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctors</h1>
              <p className="text-gray-600 text-lg">Manage doctors and their information</p>
            </div>
            <button
              onClick={() => setCurrentView('add')}
              className="flex items-center gap-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Add Doctor
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              icon={UserGroupIcon} 
              title="Total Doctors" 
              value={doctors.length} 
              color="blue"
            />
            <StatsCard 
              icon={CheckCircleIcon} 
              title="Active Doctors" 
              value={activeDoctors} 
              color="green"
            />
            <StatsCard 
              icon={BuildingOfficeIcon} 
              title="Total Hospitals" 
              value={totalHospitals} 
              color="purple"
            />
            <StatsCard 
              icon={StarIcon} 
              title="My Hospitals" 
              value={myHospitals} 
              subtitle={authenticated ? 'Authenticated' : 'Not connected'}
              color="orange"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all"
                />
              </div>
              
              <select
                value={filterHospital}
                onChange={(e) => setFilterHospital(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all"
              >
                <option value="">All Hospitals</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A2F2EF]/20 focus:border-[#A2F2EF] transition-all"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div className="flex items-center justify-center bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">
                  {filteredDoctors.length} doctors found
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#A2F2EF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading doctors...</p>
            </div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => setCurrentView('add')}
              className="px-6 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Add First Doctor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                hospital={hospitals.find(h => h.id === doctor.hospitalId)}
                onToggleStatus={handleToggleDoctorStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;