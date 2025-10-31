import React, { useState, useEffect } from 'react';
import { Users, Activity, FileText, Calendar, Building2, ChevronRight, ClockAlert, ArrowLeft, Zap, RefreshCw, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { getPrincipal, getActor, isAuthenticated } from '../../../service/auth';
import { singleHospitalExpirationCheck } from '../../../service/hospitalExpiration';
import { getRemainingTime } from '../../../components_global/time'
import { SubscriptionModal } from '../components/subscriptionModal'
import { ExtendModal } from '../components/extendModal'
import { useHospitals } from "@/context/hospitalContext";

const Adashboard = () => {
  const [currentView, setCurrentView] = useState('hospitals');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalActivateHospital, setModalActivateHospital] = useState(null); // Track activate hospital's modal is open
  const [modalExtendHospital, setModalExtendHospital] = useState(null); // Track extend hospital's modal is open
  // Pinata configuration
  const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;
  const { hospitals, loading: hospitalsLoading, error: hospitalsError } = useHospitals();

  // Initialize auth data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isAuthenticated();
        if (isAuth) {
          const currentPrincipal = getPrincipal();
          const currentActor = getActor();
          setPrincipal(currentPrincipal);
          setActor(currentActor);
        } else {
          setPrincipal(null);
          setActor(null);
        }
      } catch (err) {
        setError('Failed to initialize authentication: ' + err.message);
      }
    };
    initializeAuth();
    const authInterval = setInterval(initializeAuth, 5000);
    return () => clearInterval(authInterval);
  }, []);

  // Helper function to process IPFS URL
  const processIPFSUrl = (url) => {
    if (!url) return null;
    
    // If it's already using our custom gateway, return as is
    if (url.includes(PINATA_GATEWAY)) {
      return url;
    }
    
    // If it's a standard IPFS URL, convert to our gateway
    if (url.startsWith('https://ipfs.io/ipfs/')) {
      const hash = url.replace('https://ipfs.io/ipfs/', '');
      return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
    }
    
    // If it's an ipfs:// protocol URL
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '');
      return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
    }
    
    // If it contains an IPFS hash pattern (Qm... or baf...)
    const ipfsHashMatch = url.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|[a-f0-9]{46,})/);
    if (ipfsHashMatch) {
      return `https://${PINATA_GATEWAY}/ipfs/${ipfsHashMatch[1]}`;
    }
    
    // If it's already a complete URL, return as is
    return url;
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Fetch doctors from canister
  const fetchDoctors = async () => {
    try {
      if (!actor) return;
      const result = await actor.getDoctors();
      setDoctors(result || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  // Fetch medical records for a specific patient
  const fetchMedicalRecords = async (patientId) => {
    try {
      if (!actor) return [];
      const result = await actor.getMedicalRecordsByPatient(patientId);
      console.log(`Fetched medical records for hospitalId=`, result);

      return result || [];
    } catch (err) {
      return [];
    }
  };

  const fetchMedicalRecordsHospitalID = async (hospitalId, page, pageSize) => {
    try {
      if (!actor) {
        console.log('actor is not ready in fetchMedicalRecordsHospitalID');
        return [];
      }
      console.log('Calling getMedicalRecordsByHospitalPaged on actor', hospitalId, page, pageSize);
      const result = await actor.getMedicalRecordsByHospitalPaged(hospitalId, page, pageSize);
      console.log('Result from getMedicalRecordsByHospitalPaged:', result);
      return result || [];
    } catch (err) {
      console.error('Error in fetchMedicalRecordsHospitalID:', err);
      return [];
    }
  };

  // Get available doctors for specific day and hospital
  const fetchAvailableDoctors = async (hospitalId, dayOfWeek) => {
    try {
      if (!actor) return [];
      const result = await actor.getAvailableDoctors(hospitalId, dayOfWeek);
      return result || [];
    } catch (err) {
      return [];
    }
  };

  // Get doctor patients count
  const fetchDoctorPatientsCount = async (doctorId) => {
    try {
      if (!actor) return 0;
      const result = await actor.getDoctorPatientsCount(doctorId);
      return Number(result) || 0;
    } catch (err) {
      return 0;
    }
  };

  // Check if user has access to hospital
  const checkHospitalAccess = (hospital) => {
    if (!principal || !hospital) return false;
    const hospitalWallet = hospital.walletAddress?.toText ? 
      hospital.walletAddress.toText() : 
      hospital.walletAddress?.toString();
    return hospitalWallet === principal;
  };

  // Initialize and fetch data when auth is ready
  useEffect(() => {
    const initialize = async () => {
      if (!principal || !actor) {
        setError(null);
        setLoading(false);
        return;
      }
      try {
        console.log("fetch doctors")
        await fetchDoctors();
      } catch (err) {
        setError('Failed to initialize dashboard: ' + err.message);
      }
    };
    initialize();
  }, [principal, actor]);

  // Real-time data updates
  useEffect(() => {
    if (hospitals.length > 0 && principal && actor) {
      const interval = setInterval(async () => {
        try {
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Failed to refresh data:', err);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [hospitals.length, principal, actor]);

  // Calculate hospital statistics
  const getHospitalStats = async (hospitalId) => {
    try {
      const hospitalDoctors = doctors.filter(d => Number(d.hospitalId) === Number(hospitalId));
      const activeDoctors = hospitalDoctors.filter(d => d.isActive);
      let totalPatients = 0;
      for (const doctor of hospitalDoctors) {
        const count = await fetchDoctorPatientsCount(Number(doctor.id));
        totalPatients += count;
      }
      const today = new Date().getDay();
      const availableToday = await fetchAvailableDoctors(hospitalId, today);
      return {
        totalDoctors: hospitalDoctors.length,
        activeDoctors: activeDoctors.length,
        totalPatients: totalPatients,
        todayAppointments: availableToday.length * 8
      };
    } catch (err) {
      return {
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
        todayAppointments: 0
      };
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = async (hospital) => {
    if (!checkHospitalAccess(hospital)) {
      setError('Access denied. You are not registered for this hospital.');
      return;
    }
    const hospitalIsExpired = await singleHospitalExpirationCheck(hospital,actor);
    setLoading(true);
    setSelectedHospital(hospital);
    console.log("ini hospital", hospital)
    // If the Hospital subs is not expired
    if (!hospitalIsExpired) {
      try {
        const stats = await getHospitalStats(Number(hospital.id));
        setSelectedHospital(prev => ({ ...prev, stats }));

        const allRecords = [];
        console.log('actor before fetchMedicalRecordsHospitalIDD:', actor);

        const recordsByHospitalId = await fetchMedicalRecordsHospitalID(Number(hospital.id),0,5);
        setMedicalRecords(recordsByHospitalId);
        console.log(recordsByHospitalId,Number(hospital.id))
        setCurrentView('dashboard');
        setError(null);
      } catch (err) {
        setError('Failed to load hospital data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    else{
      setError('Failed to load hospital data, expired:');
      setLoading(false);
    }
  };

  const sortedRecords = [...medicalRecords].sort((a, b) => {
    return sortOrder === 'desc'
      ? Number(b.createdAt) - Number(a.createdAt)
      : Number(a.createdAt) - Number(b.createdAt);
  });

  // Refresh data manually
  const refreshData = async () => {
    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await fetchDoctors();
      if (selectedHospital) {
        const stats = await getHospitalStats(Number(selectedHospital.id));
        setSelectedHospital(prev => ({ ...prev, stats }));
      }
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to refresh data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleString();
    } catch (err) {
      return 'Unknown time';
    }
  };

  // Enhanced Hospital Logo component with IPFS support
  const HospitalLogo = ({ logoURL, hospitalName, size = 'default' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [processedUrl, setProcessedUrl] = useState(null);
    
    const sizeClasses = {
      small: 'w-10 h-10',
      default: 'w-14 h-14',
      large: 'w-16 h-16'
    };

    const iconSizes = {
      small: 'w-5 h-5',
      default: 'w-7 h-7',
      large: 'w-8 h-8'
    };

    useEffect(() => {
      if (logoURL) {
        const processed = processIPFSUrl(logoURL);
        setProcessedUrl(processed);
        setImageError(false);
        setImageLoaded(false);
        console.log('Original logo URL:', logoURL);
        console.log('Processed logo URL:', processed);
      }
    }, [logoURL]);

    const handleImageError = (e) => {
      console.error('Image failed to load:', processedUrl);
      setImageError(true);
      
      // Try fallback URLs if the original fails
      if (logoURL && !imageError) {
        // Try different IPFS gateways
        const fallbackGateways = [
          'https://ipfs.io/ipfs/',
          'https://gateway.pinata.cloud/ipfs/',
          'https://cloudflare-ipfs.com/ipfs/'
        ];
        
        const ipfsHashMatch = logoURL.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|[a-f0-9]{46,})/);
        if (ipfsHashMatch && fallbackGateways.length > 0) {
          const hash = ipfsHashMatch[1];
          const fallbackUrl = fallbackGateways[0] + hash;
          console.log('Trying fallback URL:', fallbackUrl);
          e.target.src = fallbackUrl;
          fallbackGateways.shift(); // Remove the used gateway
          return;
        }
      }
    };

    if (!logoURL || imageError) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] rounded-2xl flex items-center justify-center shadow-lg`}>
          <Building2 className={`${iconSizes[size]} text-slate-700`} />
        </div>
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-white relative`}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <Building2 className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}
        <img
          src={processedUrl}
          alt={`${hospitalName} logo`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={() => {
            console.log('Image loaded successfully:', processedUrl);
            setImageLoaded(true);
          }}
          style={{ backgroundColor: 'white' }}
          crossOrigin="anonymous"
        />
      </div>
    );
  };

  // Enhanced Doctor Photo component with IPFS support
  const DoctorPhoto = ({ photoURL, doctorName }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [processedUrl, setProcessedUrl] = useState(null);

    useEffect(() => {
      if (photoURL) {
        const processed = processIPFSUrl(photoURL);
        setProcessedUrl(processed);
        setImageError(false);
        setImageLoaded(false);
      }
    }, [photoURL]);

    const handleImageError = (e) => {
      setImageError(true);
      
      // Try fallback URLs if the original fails
      if (photoURL && !imageError) {
        const fallbackGateways = [
          'https://ipfs.io/ipfs/',
          'https://gateway.pinata.cloud/ipfs/'
        ];
        
        const ipfsHashMatch = photoURL.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|[a-f0-9]{46,})/);
        if (ipfsHashMatch && fallbackGateways.length > 0) {
          const hash = ipfsHashMatch[1];
          const fallbackUrl = fallbackGateways[0] + hash;
          e.target.src = fallbackUrl;
          fallbackGateways.shift();
          return;
        }
      }
    };

    if (!photoURL || imageError) {
      return (
        <span className="text-slate-600 text-xl font-bold flex items-center justify-center">
          {doctorName?.charAt(0) || 'D'}
        </span>
      );
    }

    return (
      <>
        {!imageLoaded && (
          <span className="text-slate-600 text-xl font-bold flex items-center justify-center">
            {doctorName?.charAt(0) || 'D'}
          </span>
        )}
        <img
          src={processedUrl}
          alt={doctorName}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={() => setImageLoaded(true)}
          crossOrigin="anonymous"
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </>
    );
  };

  // No authenticated user
  if (!principal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/70 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-slate-700" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome Back</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">Please login with Internet Identity to access your medical dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-2xl font-semibold hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Actor not available
  if (!actor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/70 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">
          <RefreshCw className="w-20 h-20 text-slate-500 mx-auto mb-6 animate-spin" />
          <h2 className="text-3xl font-bold text-slate-800 mb-3">System Loading</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">Connecting to the blockchain network...</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-2xl font-semibold hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const handleCardClick = () => {
    if (hasAccess && isActive && onHospitalSelect) {
      onHospitalSelect(hospital);
    }
  };


  const handleSubscribe = async (hospitalId,plan) => {
    console.log(`Subscribed ${plan} with ID ${hospitalId}`);
    try{
      if (!actor) return;
      const result = await actor.toggleHospitalActiveStatus(hospitalId,plan);
      setError(result);
    }
    catch(err){
      console.error(err)
    }
  };

  const handleExtend = async (hospitalId,plan) => {
    console.log(`Extend ${plan} with ID ${hospitalId}`);
    try{
      if (!actor) return;
      const result = await actor.extendHospital(hospitalId,plan);
      setError(result);
    }
    catch(err){
      console.error(err)
    }
  };



  // Hospitals List View
  const HospitalsView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Medical Dashboard</h1>
            <p className="text-slate-600 text-lg">Select a hospital to access your dashboard</p>
          </div>
          
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] rounded-full"></div>
              <span className="text-sm text-slate-600">
                Connected: <span className="font-semibold text-slate-800">{principal?.slice(0, 8)}...{principal?.slice(-6)}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">Updated: {lastUpdate.toLocaleTimeString()}</span>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-xl font-semibold hover:shadow-md disabled:opacity-50 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && hospitals.length === 0 && (
          <div className="text-center py-20">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-[#A2F2EF] mb-6" />
            <p className="text-slate-600 text-lg">Loading hospitals...</p>
          </div>
        )}

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {hospitals.map((hospital) => {
            const hasAccess = checkHospitalAccess(hospital);
            const hospitalDoctors = doctors.filter(d => Number(d.hospitalId) === Number(hospital.id));
            const activeDoctors = hospitalDoctors.filter(d => d.isActive);
            const walletAddress = hospital.walletAddress?.toText 
              ? hospital.walletAddress.toText()
              : hospital.walletAddress?.toString();
            const truncatedWallet = walletAddress 
              ? `${walletAddress.slice(0, 12)}...${walletAddress.slice(-8)}`
              : '';

            // Render hospital card based on active status
            return hospital.isActive ? (
              // ACTIVE HOSPITAL CARD
              <div
                key={`active-${hospital.id}`}
                className={`bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30 transition-all duration-300 ${
                  hasAccess 
                    ? 'hover:bg-white/80 hover:shadow-2xl cursor-pointer hover:-translate-y-2 hover:border-[#A2F2EF]/30' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => hasAccess && handleHospitalSelect(hospital)}
              >
                <HospitalCardContent 
                  hospital={hospital}
                  hasAccess={hasAccess}
                  hospitalDoctors={hospitalDoctors}
                  activeDoctors={activeDoctors}
                  truncatedWallet={truncatedWallet}
                  isActive={true}
                />
              </div>
            ) : (
              // INACTIVE HOSPITAL CARD
              <div 
                key={`inactive-${hospital.id}`}
                className="bg-gray-100/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 opacity-75 relative"
              >
                <HospitalCardContent 
                  hospital={hospital}
                  hasAccess={hasAccess}
                  hospitalDoctors={hospitalDoctors}
                  activeDoctors={[]}
                  truncatedWallet={truncatedWallet}
                  isActive={false}
                />
                
                {/* Activate button for inactive hospitals */}
                <div className={`flex justify-center mt-3 ${!hasAccess && 'hidden'}`}>
                  <button
                    onClick={() => setModalActivateHospital(hospital)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Activate Hospital</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {modalActivateHospital && (
          <SubscriptionModal
            isOpen={!!modalActivateHospital}
            onClose={() => setModalActivateHospital(null)}
            hospitalName={modalActivateHospital.name}
            onSubscribe={(selectedPlan) => {
              handleSubscribe(Number(modalActivateHospital.id),selectedPlan);
              setModalActivateHospital(null);
            }}
          />
        )}
        {/* Empty State */}
        {!loading && hospitals.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Building2 className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">No Hospitals Available</h3>
            <p className="text-slate-600 mb-8 text-lg">No hospitals are currently registered in the system</p>
            <button
              onClick={refreshData}
              className="px-8 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-2xl font-semibold hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
  const HospitalCardContent = ({ 
    hospital, 
    hasAccess, 
    hospitalDoctors, 
    activeDoctors, 
    truncatedWallet,
    isActive
  }) => {
    return (
      <>
        <div className="flex items-start space-x-6 mb-6">
          {/* Hospital logo with inactive overlay if not active */}
          <div className="relative">
            <HospitalLogo logoURL={hospital.logoURL} hospitalName={hospital.name} />
            {!isActive && <div className="absolute inset-0 bg-gray-500/50 rounded-xl"></div>}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold mb-2 truncate ${
              isActive ? 'text-slate-800' : 'text-gray-600'
            }`}>
              {hospital.name}
            </h3>
            
            {/* Doctors count information */}
            <div className={`flex items-center space-x-6 mb-3 ${
              isActive ? 'text-slate-600' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">{hospitalDoctors.length}</span>
                <span className="text-sm">doctors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${
                  isActive ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="font-semibold">{isActive ? activeDoctors.length : 0}</span>
                <span className="text-sm">{isActive ? 'active' : 'inactive'}</span>
              </div>
            </div>
          </div>
          
          {/* Show chevron only for active and accessible hospitals */}
          {isActive && hasAccess && <ChevronRight className="w-6 h-6 text-slate-400" />}
        </div>
        
        {/* Wallet address and status section */}
        <div className="space-y-3">
          <div className={`text-sm rounded-xl p-3 truncate ${
            isActive 
              ? 'text-slate-500 bg-slate-100/50' 
              : 'text-gray-500 bg-gray-200/50'
          }`}>
            <span className="font-medium">Wallet:</span> {truncatedWallet}
          </div>
          
          <div className="flex items-center justify-between">
            {/* Status indicator */}
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !isActive ? 'bg-gray-400' : 
                hasAccess ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className={`text-sm font-semibold ${
                !isActive ? 'text-gray-500' : 
                hasAccess ? 'text-green-600' : 'text-red-600'
              }`}>
                {!isActive ? 'Inactive' : hasAccess ? 'Access Granted' : 'Access Denied'}
              </span>
            </div>
            
            {/* Hospital ID badge */}
            <span className={`text-xs px-3 py-1 rounded-lg font-mono ${
              isActive ? 'text-slate-400 bg-slate-100' : 'text-gray-400 bg-gray-200'
            }`}>
              #{Number(hospital.id)}
            </span>
          </div>
        </div>
      </>
    );
  };


  // Hospital Dashboard View
  const DashboardView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCurrentView('hospitals')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors bg-white/60 rounded-2xl px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Hospitals</span>
            </button>
            <div className="flex items-center space-x-4">
              <HospitalLogo logoURL={selectedHospital?.logoURL} hospitalName={selectedHospital?.name} />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{selectedHospital?.name}</h1>
                <p className="text-slate-600">Hospital Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Updated: {lastUpdate.toLocaleTimeString()}</span>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-2 py-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-xl font-semibold hover:shadow-md disabled:opacity-50 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setModalExtendHospital(selectedHospital)}
              className={`${getRemainingTime(selectedHospital.expiredAt) === "Lifetime" ? "hidden " : ""}flex items-center space-x-2 px-2 py-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-slate-700 rounded-xl font-medium hover:shadow-md disabled:opacity-50 transition-all duration-300`}
            >
              <span>Extend Plan</span>
            </button>
          </div>
        </div>
        {modalExtendHospital && (
          <ExtendModal
            isOpen={!!modalExtendHospital}
            onClose={() => setModalExtendHospital(null)}
            hospitalName={modalExtendHospital.name}
            onSubscribe={(selectedPlan) => {
              handleExtend(Number(modalExtendHospital.id),selectedPlan);
              setModalExtendHospital(null);
            }}
          />
        )}
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl">⋯</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {selectedHospital?.stats?.totalDoctors || 0}
            </div>
            <div className="text-slate-600 font-medium mb-3">Total Doctors</div>
            <div className="text-sm text-slate-500">All registered physicians</div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl">⋯</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {selectedHospital?.stats?.activeDoctors || 0}
            </div>
            <div className="text-slate-600 font-medium mb-3">Active Doctors</div>
            <div className="text-sm text-slate-500">Currently available</div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl">⋯</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {selectedHospital?.stats?.totalPatients || 0}
            </div>
            <div className="text-slate-600 font-medium mb-3">Total Patients</div>
            <div className="text-sm text-slate-500">All medical records</div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl">⋯</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {selectedHospital?.stats?.todayAppointments || 0}
            </div>
            <div className="text-slate-600 font-medium mb-3">Today's Capacity</div>
            <div className="text-sm text-slate-500">Estimated appointments</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Medical Records Section */}
          <div className="xl:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Recent Medical Records</h3>
                <button className="text-[#A2F2EF] hover:text-[#8EEAE7] font-semibold transition-colors">
                  View All →
                </button>
              </div>
              
              {loading && (
                <div className="text-center py-16">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#A2F2EF] mb-4" />
                  <p className="text-slate-600">Loading medical records...</p>
                </div>
              )}
              {/* Sort Button */}
              <button
                onClick={toggleSortOrder}
                className="inline-flex items-center gap-2 px-2 py-1 mb-4 rounded-md bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] text-dark transition"
                aria-label="Toggle sort order"
                title="Toggle sort order"
              >
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                {sortOrder === 'desc' ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>

              {/* Content */}
              {!loading && medicalRecords.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-600">No medical records found</p>
                </div>
              )}
              <div className="space-y-4">
                {sortedRecords.map((record,index) => {
                  const doctor = doctors.find(d => Number(d.id) === Number(record.doctorId));
                  return (
                    <div
                      key={Number(record.id)}
                      className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/70 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#A2F2EF] to-[#8EEAE7] rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-slate-700 font-bold text-lg">
                            {index+1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-800">Patient #{Number(record.patientId)}</h4>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                              <FileText className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-slate-600 font-medium mb-1">
                            Dr. {doctor?.name || 'Unknown'} • {record.diagnosis}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>{record.prescriptions.length} prescriptions</span>
                            <span>•</span>
                            <span>{formatTime(record.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Doctors Section */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Hospital Staff</h3>
                <span className="text-slate-400 text-2xl cursor-pointer">⋯</span>
              </div>
              
              <div className="space-y-6">
                {doctors
                  .filter(d => Number(d.hospitalId) === Number(selectedHospital?.id))
                  .slice(0, 6)
                  .map((doctor) => (
                    <div key={Number(doctor.id)} className="flex items-center space-x-4 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/60 transition-all duration-300">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg">
                          <DoctorPhoto photoURL={doctor.photoURL} doctorName={doctor.name} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          doctor.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{doctor.name}</h4>
                        <p className="text-slate-600 text-sm truncate">{doctor.specialty || 'General Practice'}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-xl ${
                            doctor.isActive 
                              ? 'text-green-700 bg-green-100' 
                              : 'text-red-700 bg-red-100'
                          }`}>
                            {doctor.isActive ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {doctors.filter(d => Number(d.hospitalId) === Number(selectedHospital?.id)).length > 6 && (
                <div className="mt-6 text-center">
                  <button className="text-[#A2F2EF] hover:text-[#8EEAE7] font-semibold transition-colors">
                    View All Doctors →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700">Doctors</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {doctors.filter(d => Number(d.hospitalId) === Number(selectedHospital?.id)).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-slate-700">Active Now</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {doctors.filter(d => Number(d.hospitalId) === Number(selectedHospital?.id) && d.isActive).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-700">Records</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {medicalRecords.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                      <ClockAlert className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium text-slate-700">Expired</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800">
                      {getRemainingTime(selectedHospital.expiredAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans antialiased">
      {currentView === 'hospitals' ? <HospitalsView /> : <DashboardView />}
    </div>
  );
};

export default Adashboard;