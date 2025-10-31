import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BuildingOfficeIcon, ShieldExclamationIcon, CheckIcon, CurrencyDollarIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const Buy = () => {
  const {
    actor,
    principal,
    isConnected,
    userRole,
    roleLoading,
    refreshUserRole,
    formatPrincipal
  } = useOutletContext();
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    logoURL: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registrationResult, setRegistrationResult] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewURL, setLogoPreviewURL] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [uploadProgress, setUploadProgress] = useState(0);
  const hashValue = window.location.hash.substring(1);

  // Pinata configuration
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY ;
  const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT ;
  const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY ;

  // Pricing plans (frontend only)
  const pricingPlans = [
    {
      id: 'trial',
      name: 'Trial Plan',
      price: '0 ICP',
      duration: '3 Days',
      features: ['Hospital Registration', 'Basic Features'],
      popular: false,
      hidden:true,
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '100 ICP',
      duration: '1 Month',
      features: ['Hospital Registration', 'Basic Features', 'Monthly Billing'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: '500 ICP',
      duration: '12 Months',
      features: ['Hospital Registration', 'All Features', 'Annual Billing', 'Save 58%'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Plan',
      price: '1,000 ICP',
      duration: 'Lifetime',
      features: ['Hospital Registration', 'All Features', 'One-time Payment', 'Best Value'],
      popular: false
    }
  ];

  // Handle logo file changes
  useEffect(() => {
    console.log('hash value : ',hashValue);
    if (hashValue === "trial"){
      setSelectedPlan(hashValue)
    }
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreviewURL(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setLogoPreviewURL('');
    }
  }, [logoFile]);

  // Upload file to Pinata
  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const pinataMetadata = JSON.stringify({
      name: `hospital-logo-${Date.now()}`,
      keyvalues: {
        hospitalName: formData.hospitalName || 'unknown',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try {
      setIsUploadingLogo(true);
      setUploadProgress(20);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      
      // Return the IPFS URL using the custom gateway
      const ipfsUrl = `https://${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
      return ipfsUrl;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error(`Failed to upload logo to IPFS: ${error.message}`);
    } finally {
      setIsUploadingLogo(false);
      setTimeout(() => setUploadProgress(0), 1000);
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

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      if (errors.logoURL) {
        setErrors((prev) => ({ ...prev, logoURL: '' }));
      }
    }
  };

  const handleFilePaste = (e) => {
    const items = (e.clipboardData || window.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        setLogoFile(file);
        if (errors.logoURL) {
          setErrors((prev) => ({ ...prev, logoURL: '' }));
        }
        break;
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      if (errors.logoURL) {
        setErrors((prev) => ({ ...prev, logoURL: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required';
    }
    if (!logoFile && !formData.logoURL) {
      newErrors.logoURL = 'Hospital logo is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!actor) {
      setErrors({ submit: 'Blockchain connection not initialized. Please connect your wallet first.' });
      return;
    }

    if (!principal) {
      setErrors({ submit: 'Principal not found. Please connect your wallet first.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let logoUrl = formData.logoURL;

      // Upload logo to Pinata if a file is selected
      if (logoFile) {
        try {
          console.log('Uploading logo to Pinata...');
          logoUrl = await uploadToPinata(logoFile);
          console.log('Logo uploaded successfully:', logoUrl);
          
          // Update form data with the IPFS URL
          setFormData(prev => ({ ...prev, logoURL: logoUrl }));
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          setErrors({ submit: `Logo upload failed: ${uploadError.message}` });
          setIsSubmitting(false);
          return;
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Register hospital with IPFS logo URL
      console.log('Registering hospital with logo URL:', logoUrl);
      const result = await actor.registerHospital(
        formData.hospitalName.trim(),
        logoUrl,
        selectedPlan,
      );
      console.log('Registration result:', result);
      
      // Refresh user role after successful registration
      await refreshUserRole();
      
      setRegistrationResult(`Hospital "${formData.hospitalName}" has been successfully registered with ${pricingPlans.find(p => p.id === selectedPlan)?.name}!`);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        if (error.message.includes('rejected')) {
          errorMessage = 'Transaction rejected. Please ensure you have the necessary access.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network connection issue. Please try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ hospitalName: '', logoURL: '' });
    setLogoFile(null);
    setLogoPreviewURL('');
    setErrors({});
    setSubmitSuccess(false);
    setRegistrationResult('');
    setSelectedPlan('monthly');
    setUploadProgress(0);
  };

  // Show loading while checking user role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for doctors
  if (isConnected && userRole === 'doctor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <ShieldExclamationIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Sorry, doctors are not allowed to register hospitals. Only hospital administrators can access this feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show connection requirement if not connected
  if (!isConnected || !principal || !actor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0FFFE] flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <BuildingOfficeIcon className="w-20 h-20 text-[#A2F2EF] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please connect your Internet Identity wallet to register a hospital on the blockchain.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] hover:from-[#8EEAE7] hover:to-[#7AE7E4] text-gray-900 px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0FFFE] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!submitSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Register Your Hospital</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join the decentralized healthcare network and register your hospital on the Internet Computer blockchain
              </p>
              {principal && (
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-emerald-800 font-medium">
                    Connected: {formatPrincipal(principal)}
                  </span>
                </div>
              )}
            </div>

            {/* Pricing Plans */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${plan.hidden && "hidden"} relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer transform hover:scale-105 ${
                      selectedPlan === plan.id
                        ? 'border-[#A2F2EF] shadow-xl'
                        : plan.popular
                        ? 'border-[#A2F2EF] shadow-xl'
                        : 'border-gray-200 hover:border-[#A2F2EF]'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-[#A2F2EF] mb-1">{plan.price}</div>
                        <p className="text-gray-500">{plan.duration}</p>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id
                            ? 'bg-[#A2F2EF] border-[#A2F2EF]'
                            : 'border-gray-300'
                        }`}>
                          {selectedPlan === plan.id && (
                            <CheckIcon className="w-3 h-3 text-gray-900 m-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] p-6">
                <h2 className="text-2xl font-bold text-gray-900">Hospital Registration</h2>
                <p className="text-gray-700 mt-1">Complete the form below to register your hospital</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Logo Upload Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Logo</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 h-80 flex items-center justify-center relative hover:border-[#A2F2EF] transition-colors">
                      <div
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                        onDrop={handleFileDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onPaste={handleFilePaste}
                        tabIndex={0}
                      >
                        {logoPreviewURL || formData.logoURL ? (
                          <div className="relative w-full h-full">
                            <img
                              src={logoPreviewURL || formData.logoURL}
                              alt="Hospital Logo Preview"
                              className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                              onClick={() => {
                                setLogoFile(null);
                                setFormData((prev) => ({ ...prev, logoURL: '' }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <BuildingOfficeIcon className="w-16 h-16 text-[#A2F2EF] mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-2">Drag & Drop your logo here</p>
                            <p className="text-gray-500 mb-4">or paste from clipboard</p>
                            <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 rounded-lg font-medium cursor-pointer hover:from-[#8EEAE7] hover:to-[#7AE7E4] transition-all transform hover:scale-105">
                              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                              Choose File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading to IPFS...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {errors.logoURL && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                        {errors.logoURL}
                      </p>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-8">
                    <h3 className="text-lg font-semibold text-gray-900">Hospital Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Hospital Name *
                        <span className="text-xs text-blue-600 ml-2">(stored on blockchain)</span>
                      </label>
                      <input
                        type="text"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent transition-all ${
                          errors.hospitalName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., General Medical Center"
                        maxLength={100}
                      />
                      {errors.hospitalName && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                          {errors.hospitalName}
                        </p>
                      )}
                    </div>

                    {/* Selected Plan Display */}
                    <div className="bg-gradient-to-r from-[#A2F2EF]/10 to-[#8EEAE7]/10 rounded-xl p-6 border border-[#A2F2EF]/20">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Plan</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-[#A2F2EF]">
                          {pricingPlans.find(p => p.id === selectedPlan)?.name}
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          {pricingPlans.find(p => p.id === selectedPlan)?.price}
                        </span>
                      </div>
                    </div>

                    {/* IPFS Info */}
                    {formData.logoURL && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                          Logo uploaded to IPFS
                        </h4>
                        <p className="text-blue-700 text-sm break-all">
                          {formData.logoURL}
                        </p>
                      </div>
                    )}

                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-800 font-medium flex items-center">
                          <ShieldExclamationIcon className="w-5 h-5 mr-2" />
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
                      >
                        Reset Form
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploadingLogo || !actor || !principal}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] hover:from-[#8EEAE7] hover:to-[#7AE7E4] text-gray-900 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        {isUploadingLogo ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                            Uploading Logo...
                          </>
                        ) : isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                            Processing Registration...
                          </>
                        ) : (
                          `Register Hospital (${pricingPlans.find(p => p.id === selectedPlan)?.price})`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckIcon className="w-12 h-12 text-gray-900" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Registration Successful!</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{registrationResult}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] hover:from-[#8EEAE7] hover:to-[#7AE7E4] text-gray-900 px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Register Another Hospital
              </button>
              <button
                onClick={() => window.history.back()}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 font-medium transition-all"
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;