
// Utility function to check if hospital is expired (frontend calculation)
// This to make sure that we use cycle if it really needed
export const isHospitalExpired = (hospital) => {
  if (!hospital.expiredAt || hospital.expiredAt.length === 0) {
    return false;
  }
  
  const nowInSec = Math.floor(Date.now() / 1000);
  const expiredAt = Number(hospital.expiredAt[0]); // Handle Optional type from Motoko
  console.log("Is Hospital Expired?",expiredAt < nowInSec)
  console.log("Is Hospital Active?",hospital.isActive)
  return expiredAt < nowInSec;
};

export const singleHospitalExpirationCheck = async (hospital, actor) => {
  // First, quick frontend check
  const frontendExpired = isHospitalExpired(hospital);
  console.log("Ini actor di service",actor)
  console.log("Actorr : " ,Object.keys(actor));
  if (!frontendExpired) {
    return false; // Not expired, no need for backend call
  }
  
  // Only call backend if frontend thinks it's expired AND hospital is still active
  if (hospital.isActive) {
    try {
      console.log("Deactivate Hospital : ",hospital.id)
      return await actor.deactivateHospitalIfExpired(Number(hospital.id));
    } catch (error) {
      console.error('Backend expiration check failed:', error);
      return frontendExpired; // Fall back to frontend calculation
    }
  }
  
  return true; // Expired and already inactive
};


export const multipleHospitalExpirationCheckBatch = async (hospitals, actor) => {
  if (!Array.isArray(hospitals) || hospitals.length === 0) {
    return [];
  }

  const expiredCandidates = hospitals.filter((h) => isHospitalExpired(h) && h.isActive);

  // If there are no expired hospital
  if (expiredCandidates.length === 0) {
    return hospitals.map((h) => ({ ...h, expired: isHospitalExpired(h) }));
  }

  try {
    let deactivatedIds = [];

    if (expiredCandidates.length === 1) {
      const h = expiredCandidates[0];
      const result = await actor.deactivateHospitalIfExpired(Number(h.id));
      if (result) {
        deactivatedIds = [Number(h.id)];
      }
    } else {
      const ids = expiredCandidates.map((h) => Number(h.id));
      deactivatedIds = await actor.deactivateHospitalsIfExpired(ids);
    }

    // Update Results
    return hospitals.map((h) => ({
      ...h,
      expired: deactivatedIds.includes(Number(h.id)) || isHospitalExpired(h),
    }));
  } catch (error) {
    console.error("Backend batch check gagal:", error);
    // fallback
    return hospitals.map((h) => ({ ...h, expired: isHospitalExpired(h) }));
  }
};
