import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../../components_global/time'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

const MedicalRecord = () => {
  const { principal, actor } = useOutletContext();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [userHospitals, setUserHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState('view');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actorError, setActorError] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    hospitalId: '',
    diagnosis: '',
    cpptURL: '',
    cpptInputType: 'url', // 'url' or 'upload'
    evidenceURLs: [''],
    evidenceInputTypes: ['url'], // array matching evidenceURLs
    prescriptions: [
      {
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStates, setUploadStates] = useState({
    cppt: { uploading: false, progress: 0 },
    evidence: {} // will store by index
  });

  useEffect(() => {
    console.log('MedicalRecord mounted, principal:', principal, 'actor:', actor);
    if (actor && principal && principal !== '2vxsx-fae') {
      loadBlockchainData();
    } else {
      console.warn('Cannot load data: principal or actor missing, or principal is anonymous');
    }
  }, [actor, principal]);

  // Pinata upload function
  const uploadToPinata = async (file, type, index = null) => {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: `${type}_${Date.now()}_${file.name}`,
      keyvalues: {
        type: type,
        uploadedBy: principal,
        timestamp: Date.now()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      // Update upload state
      if (type === 'cppt') {
        setUploadStates(prev => ({
          ...prev,
          cppt: { uploading: true, progress: 0 }
        }));
      } else if (type === 'evidence' && index !== null) {
        setUploadStates(prev => ({
          ...prev,
          evidence: {
            ...prev.evidence,
            [index]: { uploading: true, progress: 0 }
          }
        }));
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
     const ipfsUrl = `https://${PINATA_GATEWAY.replace(/^https?:\/\//, '').split('/')[0]}/ipfs/${result.IpfsHash}`;

      // Update upload state to success
      if (type === 'cppt') {
        setUploadStates(prev => ({
          ...prev,
          cppt: { uploading: false, progress: 100 }
        }));
      } else if (type === 'evidence' && index !== null) {
        setUploadStates(prev => ({
          ...prev,
          evidence: {
            ...prev.evidence,
            [index]: { uploading: false, progress: 100 }
          }
        }));
      }

      return ipfsUrl;
    } catch (error) {
      // Update upload state to error
      if (type === 'cppt') {
        setUploadStates(prev => ({
          ...prev,
          cppt: { uploading: false, progress: 0 }
        }));
      } else if (type === 'evidence' && index !== null) {
        setUploadStates(prev => ({
          ...prev,
          evidence: {
            ...prev.evidence,
            [index]: { uploading: false, progress: 0 }
          }
        }));
      }
      throw error;
    }
  };

  const loadBlockchainData = async () => {
    if (!actor) {
      console.warn('No actor provided to loadBlockchainData');
      setActorError('No blockchain connection available. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Current principal:', principal);
      const [hospitalsData, doctorsData] = await Promise.all([
        actor.getHospitals(),
        actor.getDoctors(),
      ]);

      console.log('Raw hospitals data:', hospitalsData);
      console.log('Raw doctors data:', doctorsData);

      const normalizedHospitals = hospitalsData.map(hospital => ({
        ...hospital,
        id: Number(hospital.id),
      }));
      const normalizedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        id: Number(doctor.id),
        hospitalId: Number(doctor.hospitalId),
        walletAddress: doctor.walletAddress.toString(),
      }));

      console.log('Normalized hospitals:', normalizedHospitals);
      console.log('Normalized doctors:', normalizedDoctors);

      const userDoctorRecords = normalizedDoctors.filter(
        doctor => {
          const isMatch = doctor.walletAddress.toLowerCase() === principal?.toLowerCase() && doctor.isActive;
          console.log(`Checking doctor: ${doctor.walletAddress}, isActive: ${doctor.isActive}, matches principal: ${isMatch}`);
          return isMatch;
        }
      );

      console.log('User doctor records:', userDoctorRecords);

      const userHospitalIds = userDoctorRecords.map(doctor => Number(doctor.hospitalId));
      const userHospitalsData = normalizedHospitals.filter(hospital => userHospitalIds.includes(Number(hospital.id)));

      console.log('User hospitals:', userHospitalsData);

      setHospitals(normalizedHospitals);
      setDoctors(normalizedDoctors);
      setUserHospitals(userHospitalsData);
      
      // Load all medical records by trying different patient IDs
      await loadAllMedicalRecords(normalizedDoctors[0].hospitalId);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setActorError('Failed to load data from blockchain. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedicalRecordsHospitalID = async (hospitalId, page, pageSize) => {
    if (!actor) return [];
    try {
      const result = await actor.getMedicalRecordsByHospitalPaged(hospitalId, page, pageSize);
      console.log(`Fetched medical records for hospitalId=${hospitalId}, page=${page}`, result);
      return result || [];
    } catch (err) {
      return [];
    }
  };

  const loadAllMedicalRecords = async (hospitalId) => {
    if (!actor) return;
    
    try {
      const allRecords = await fetchMedicalRecordsHospitalID(hospitalId, 0, 10);
      setMedicalRecords(allRecords);
      console.log('Medical records initialized. Use search to view specific patient records.');
    } catch (error) {
      console.error('Error initializing medical records:', error);
    }
  };

  const loadPatientRecords = async (patientId) => {
    if (!actor) {
      setMedicalRecords([]);
      return;
    }

    if (!patientId) {
      setMedicalRecords([]);
      return;
    }

    setIsLoading(true);
    try {
      const records = await actor.getMedicalRecordsByPatient(parseInt(patientId));
      const normalizedRecords = records.map(record => ({
        ...record,
        id: Number(record.id),
        patientId: Number(record.patientId),
        doctorId: Number(record.doctorId),
        hospitalId: Number(record.hospitalId),
        prescriptions: record.prescriptions || [],
      }));
      setMedicalRecords(normalizedRecords);
      console.log('Loaded patient records:', normalizedRecords);
    } catch (error) {
      console.error('Error loading patient records:', error);
      setActorError('Failed to load patient records from blockchain.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCpptInputTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      cpptInputType: type,
      cpptURL: '' // Clear URL when switching types
    }));
  };

  const handleCpptFileUpload = async (file) => {
    try {
      const ipfsUrl = await uploadToPinata(file, 'cppt');
      setFormData(prev => ({
        ...prev,
        cpptURL: ipfsUrl
      }));
    } catch (error) {
      console.error('CPPT upload error:', error);
      setErrors(prev => ({
        ...prev,
        cpptURL: `Upload failed: ${error.message}`
      }));
    }
  };

  const handleEvidenceInputTypeChange = (index, type) => {
    const newInputTypes = [...formData.evidenceInputTypes];
    newInputTypes[index] = type;
    
    const newEvidenceURLs = [...formData.evidenceURLs];
    newEvidenceURLs[index] = ''; // Clear URL when switching types
    
    setFormData(prev => ({
      ...prev,
      evidenceInputTypes: newInputTypes,
      evidenceURLs: newEvidenceURLs
    }));
  };

  const handleEvidenceFileUpload = async (index, file) => {
    try {
      const ipfsUrl = await uploadToPinata(file, 'evidence', index);
      const newEvidenceURLs = [...formData.evidenceURLs];
      newEvidenceURLs[index] = ipfsUrl;
      setFormData(prev => ({
        ...prev,
        evidenceURLs: newEvidenceURLs
      }));
    } catch (error) {
      console.error('Evidence upload error:', error);
      setErrors(prev => ({
        ...prev,
        [`evidence_${index}`]: `Upload failed: ${error.message}`
      }));
    }
  };

  const handleEvidenceURLChange = (index, value) => {
    const newEvidenceURLs = [...formData.evidenceURLs];
    newEvidenceURLs[index] = value;
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: newEvidenceURLs,
    }));
  };

  const addEvidenceURL = () => {
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: [...prev.evidenceURLs, ''],
      evidenceInputTypes: [...prev.evidenceInputTypes, 'url']
    }));
  };

  const removeEvidenceURL = (index) => {
    const newEvidenceURLs = formData.evidenceURLs.filter((_, i) => i !== index);
    const newInputTypes = formData.evidenceInputTypes.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: newEvidenceURLs,
      evidenceInputTypes: newInputTypes
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...formData.prescriptions];
    newPrescriptions[index] = {
      ...newPrescriptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      prescriptions: newPrescriptions,
    }));
  };

  const addPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ],
    }));
  };

  const removePrescription = (index) => {
    const newPrescriptions = formData.prescriptions.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      prescriptions: newPrescriptions,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Patient ID is required';
    if (!formData.hospitalId) newErrors.hospitalId = 'Hospital selection is required';
    if (!formData.diagnosis) newErrors.diagnosis = 'Diagnosis is required';
    if (!formData.cpptURL) newErrors.cpptURL = 'CPPT Document URL is required';

    // Validate prescriptions if any are filled
    const hasAnyPrescription = formData.prescriptions.some(p => 
      p.medicationName || p.dosage || p.frequency || p.duration || p.instructions
    );
    
    if (hasAnyPrescription) {
      formData.prescriptions.forEach((prescription, index) => {
        if (prescription.medicationName && !prescription.dosage) {
          newErrors[`prescription_${index}_dosage`] = 'Dosage is required when medication is specified';
        }
        if (prescription.medicationName && !prescription.frequency) {
          newErrors[`prescription_${index}_frequency`] = 'Frequency is required when medication is specified';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!actor) {
      setErrors({ submit: 'Blockchain connection not initialized. Please try logging in again.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const validEvidenceURLs = formData.evidenceURLs.filter((url) => url.trim() !== '');
      const validPrescriptions = formData.prescriptions.filter(p => 
        p.medicationName && p.dosage && p.frequency
      );

      const result = await actor.addMedicalRecord(
        parseInt(formData.patientId),
        parseInt(formData.hospitalId),
        formData.diagnosis,
        formData.cpptURL,
        validEvidenceURLs,
        validPrescriptions
      );

      if (result.includes('Unauthorized')) {
        setErrors({ submit: result });
        return;
      }

      console.log('Medical record added:', result);

      setFormData({
        patientId: '',
        hospitalId: '',
        diagnosis: '',
        cpptURL: '',
        cpptInputType: 'url',
        evidenceURLs: [''],
        evidenceInputTypes: ['url'],
        prescriptions: [
          {
            medicationName: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
          }
        ],
      });

      // Reset upload states
      setUploadStates({
        cppt: { uploading: false, progress: 0 },
        evidence: {}
      });

      alert(`Medical record added successfully: ${result}`);

      // After successful submission, if we were viewing specific patient records, reload them
      if (selectedPatientId === formData.patientId) {
        await loadPatientRecords(formData.patientId);
      }

      setActiveTab('view');
    } catch (error) {
      console.error('Failed to add medical record:', error);
      setErrors({ submit: 'Failed to add medical record to blockchain. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientFilter = async (patientId) => {
    setSelectedPatientId(patientId);
    setFilterHospital('');
    await loadPatientRecords(patientId);
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find((h) => Number(h.id) === Number(hospitalId));
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => Number(d.id) === Number(doctorId));
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesPatient = !selectedPatientId || Number(record.patientId) === Number(selectedPatientId);
    const matchesHospital = !filterHospital || Number(record.hospitalId) === Number(filterHospital);
    return matchesPatient && matchesHospital;
  });

  if (!principal || principal === '2vxsx-fae') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">
            Please login via Internet Identity to access medical records.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600 mt-2">Manage patient medical records on Internet Computer blockchain</p>
          </div>
          {activeTab === 'view' && userHospitals.length > 0 && (
            <button
              onClick={() => setActiveTab('add')}
              className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Add Medical Record
            </button>
          )}
        </div>

        {/* Error Alert */}
        {actorError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 mb-6">
            <p className="text-red-800 font-medium">{actorError}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF]"></div>
            <span className="ml-3 text-gray-600">Loading medical records...</span>
          </div>
        )}

        {/* No Hospital Access */}
        {!isLoading && userHospitals.length === 0 && activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Hospital Access</h2>
            <p className="text-gray-600 mb-4">
              You are not registered as an active doctor in any hospital.
              Please contact a hospital owner to register you as a doctor.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Available hospitals:</p>
              <p className="text-sm font-medium text-gray-900">
                {hospitals.length > 0 ? hospitals.map(h => h.name).join(', ') : 'None'}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                Current wallet: {principal}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('view')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              View Medical Records
            </button>
          </div>
        )}

        {/* Add Medical Record Form */}
        {activeTab === 'add' && !isLoading && userHospitals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('view')}
                className="text-[#A2F2EF] hover:text-[#8EEAE7] font-medium mb-4 flex items-center gap-2 transition-colors"
              >
                ← Back to Medical Records
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Add New Medical Record</h2>
              <p className="text-gray-600 mt-1">Register a new medical record to the blockchain</p>
              <div className="text-sm text-blue-600 mt-2">
                Logged in as: {principal}
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors ${
                        errors.patientId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital *
                  </label>
                  <select
                    name="hospitalId"
                    value={formData.hospitalId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors ${
                      errors.hospitalId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Hospital</option>
                    {userHospitals.map((hospital) => (
                      <option key={Number(hospital.id)} value={Number(hospital.id)}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  {errors.hospitalId && <p className="mt-1 text-sm text-red-600">{errors.hospitalId}</p>}
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors resize-none ${
                    errors.diagnosis ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter detailed diagnosis..."
                />
                {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
              </div>

              {/* CPPT Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  CPPT Document *
                </label>
                
                {/* Input Type Selector */}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleCpptInputTypeChange('url')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.cpptInputType === 'url'
                        ? 'bg-[#A2F2EF] text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    URL Link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCpptInputTypeChange('upload')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.cpptInputType === 'upload'
                        ? 'bg-[#A2F2EF] text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CloudArrowUpIcon className="w-4 h-4 inline mr-2" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {formData.cpptInputType === 'url' && (
                  <input
                    type="url"
                    name="cpptURL"
                    value={formData.cpptURL}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors ${
                      errors.cpptURL ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/cppt.pdf"
                  />
                )}

                {/* File Upload */}
                {formData.cpptInputType === 'upload' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#A2F2EF] transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleCpptFileUpload(file);
                          }
                        }}
                        className="hidden"
                        id="cppt-upload"
                        disabled={uploadStates.cppt.uploading}
                      />
                      <label
                        htmlFor="cppt-upload"
                        className={`cursor-pointer flex flex-col items-center ${
                          uploadStates.cppt.uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadStates.cppt.uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2F2EF] mb-2"></div>
                            <span className="text-sm text-gray-600">Uploading to Pinata...</span>
                          </div>
                        ) : (
                          <>
                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                              Click to upload CPPT document
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {formData.cpptURL && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">File uploaded successfully</span>
                        <a
                          href={formData.cpptURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#A2F2EF] hover:text-[#8EEAE7] underline ml-auto"
                        >
                          View File
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {errors.cpptURL && <p className="mt-1 text-sm text-red-600">{errors.cpptURL}</p>}
              </div>

              {/* Evidence URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Evidence Files (Optional)
                </label>
                <div className="space-y-4">
                  {formData.evidenceURLs.map((url, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Evidence #{index + 1}</h4>
                        {formData.evidenceURLs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEvidenceURL(index)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Input Type Selector for Evidence */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => handleEvidenceInputTypeChange(index, 'url')}
                          className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                            formData.evidenceInputTypes[index] === 'url'
                              ? 'bg-[#A2F2EF] text-gray-900'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <LinkIcon className="w-3 h-3 inline mr-1" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEvidenceInputTypeChange(index, 'upload')}
                          className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                            formData.evidenceInputTypes[index] === 'upload'
                              ? 'bg-[#A2F2EF] text-gray-900'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <CloudArrowUpIcon className="w-3 h-3 inline mr-1" />
                          Upload
                        </button>
                      </div>

                      {/* URL Input for Evidence */}
                      {formData.evidenceInputTypes[index] === 'url' && (
                        <div className="relative">
                          <PhotoIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleEvidenceURLChange(index, e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                            placeholder="https://example.com/evidence.jpg"
                          />
                        </div>
                      )}

                      {/* File Upload for Evidence */}
                      {formData.evidenceInputTypes[index] === 'upload' && (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#A2F2EF] transition-colors">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleEvidenceFileUpload(index, file);
                                }
                              }}
                              className="hidden"
                              id={`evidence-upload-${index}`}
                              disabled={uploadStates.evidence[index]?.uploading}
                            />
                            <label
                              htmlFor={`evidence-upload-${index}`}
                              className={`cursor-pointer flex flex-col items-center ${
                                uploadStates.evidence[index]?.uploading ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {uploadStates.evidence[index]?.uploading ? (
                                <div className="flex flex-col items-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A2F2EF] mb-2"></div>
                                  <span className="text-xs text-gray-600">Uploading...</span>
                                </div>
                              ) : (
                                <>
                                  <CloudArrowUpIcon className="w-6 h-6 text-gray-400 mb-1" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Click to upload evidence
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    PDF, DOC, JPG, PNG up to 10MB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                          
                          {url && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-800 font-medium">File uploaded</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#A2F2EF] hover:text-[#8EEAE7] underline ml-auto"
                              >
                                View
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {errors[`evidence_${index}`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`evidence_${index}`]}</p>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addEvidenceURL}
                    className="text-[#A2F2EF] hover:text-[#8EEAE7] text-sm font-medium transition-colors"
                  >
                    + Add Another Evidence File
                  </button>
                </div>
              </div>

              {/* Prescriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prescriptions (Optional)
                </label>
                <div className="space-y-4">
                  {formData.prescriptions.map((prescription, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Prescription #{index + 1}</h4>
                        {formData.prescriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrescription(index)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medication Name
                          </label>
                          <input
                            type="text"
                            value={prescription.medicationName}
                            onChange={(e) => handlePrescriptionChange(index, 'medicationName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                            placeholder="e.g., Paracetamol"
                          />
                          {errors[`prescription_${index}_medication`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`prescription_${index}_medication`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={prescription.dosage}
                            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                            placeholder="e.g., 500mg"
                          />
                          {errors[`prescription_${index}_dosage`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`prescription_${index}_dosage`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={prescription.frequency}
                            onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                            placeholder="e.g., 3x sehari"
                          />
                          {errors[`prescription_${index}_frequency`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`prescription_${index}_frequency`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={prescription.duration}
                            onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                            placeholder="e.g., 7 hari"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <textarea
                          value={prescription.instructions}
                          onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors resize-none"
                          placeholder="e.g., Diminum setelah makan"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="text-[#A2F2EF] hover:text-[#8EEAE7] text-sm font-medium transition-colors"
                  >
                    + Add Another Prescription
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">{errors.submit}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      patientId: '',
                      hospitalId: '',
                      diagnosis: '',
                      cpptURL: '',
                      cpptInputType: 'url',
                      evidenceURLs: [''],
                      evidenceInputTypes: ['url'],
                      prescriptions: [
                        {
                          medicationName: '',
                          dosage: '',
                          frequency: '',
                          duration: '',
                          instructions: ''
                        }
                      ],
                    });
                    setErrors({});
                    setUploadStates({
                      cppt: { uploading: false, progress: 0 },
                      evidence: {}
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !actor}
                  className="px-6 py-3 bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                      Registering to Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Register Medical Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Medical Records */}
        {activeTab === 'view' && !isLoading && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Enter Patient ID to search..."
                    value={selectedPatientId}
                    onChange={(e) => handlePatientFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                  />
                </div>
                <select
                  value={filterHospital}
                  onChange={(e) => setFilterHospital(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-colors"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPatientId ? `Records for Patient ${selectedPatientId}:` : 'Enter Patient ID to search'}
                  </span>
                  <span className="text-lg font-bold text-[#A2F2EF]">{filteredRecords.length}</span>
                </div>
              </div>
              
              {/* Clear Search Button */}
              {selectedPatientId && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedPatientId('');
                      setFilterHospital('');
                      setMedicalRecords([]);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Records Grid */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedPatientId
                    ? `No medical records found for Patient ID: ${selectedPatientId}`
                    : 'Enter a Patient ID to view medical records'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedPatientId
                    ? 'This patient may not have any medical records yet, or the ID might be incorrect.'
                    : 'Search by Patient ID above to view their medical records stored on the blockchain.'}
                </p>
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> Enter a Patient ID in the search box to load and display all medical records for that specific patient.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecords.map((record,index) => (
                  <div
                    key={Number(record.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#A2F2EF]/20 to-[#A2F2EF]/10 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <DocumentTextIcon className="w-5 h-5 text-[#A2F2EF]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Record #{index+1}</h3>
                            <p className="text-sm text-gray-600">Patient ID: {Number(record.patientId)}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#A2F2EF]/20 text-gray-800 px-3 py-1 rounded-full font-medium">
                          Blockchain
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{getHospitalName(record.hospitalId)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <UserIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">Dr. {getDoctorName(record.doctorId)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">{formatDate(record.createdAt)}</span>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <ClipboardDocumentIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Diagnosis</p>
                            <p className="text-sm text-gray-900 leading-relaxed">{record.diagnosis}</p>
                          </div>
                        </div>
                      </div>

                      {/* Prescriptions */}
                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <ClipboardDocumentIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                              Prescriptions ({record.prescriptions.length})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {record.prescriptions.slice(0, 2).map((prescription, index) => (
                              <div key={index} className="bg-white rounded-md p-3 border border-blue-100">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-medium text-sm text-gray-900">{prescription.medicationName}</h4>
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                    {prescription.dosage}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {prescription.frequency}
                                  </span>
                                  {prescription.duration && (
                                    <span>{prescription.duration}</span>
                                  )}
                                </div>
                                {prescription.instructions && (
                                  <p className="text-xs text-gray-700 mt-1 italic">
                                    {prescription.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                            {record.prescriptions.length > 2 && (
                              <div className="text-xs text-blue-600 text-center py-1">
                                +{record.prescriptions.length - 2} more prescriptions
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-4 h-4 text-[#A2F2EF]" />
                          <a
                            href={record.cpptURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#A2F2EF] hover:text-[#8EEAE7] font-medium transition-colors underline decoration-dotted"
                          >
                            View CPPT Document
                          </a>
                        </div>
                        
                        {record.evidenceURLs && record.evidenceURLs.length > 0 && (
                          <div className="flex items-start gap-3">
                            <PhotoIcon className="w-4 h-4 text-[#A2F2EF] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-600 mb-1">Evidence Files:</p>
                              <div className="space-y-1">
                                {record.evidenceURLs.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#A2F2EF] hover:text-[#8EEAE7] transition-colors underline decoration-dotted block"
                                  >
                                    Evidence #{index + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Stored on IC Blockchain</span>
                        <span className="flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecord;