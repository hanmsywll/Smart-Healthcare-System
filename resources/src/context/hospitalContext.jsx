"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const HospitalContext = createContext();

export const HospitalProvider = ({ children, actor, principal }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHospitals = async () => {
    try {
      if (!actor) return;
      setLoading(true);
      const result = await actor.getHospitals();

      setHospitals(result || []);
      console.log("fetchHospital jalan dari HospitalProvider : ", result);
      const hospitalsDeactivated = await actor.deactivateHospitalsIfExpired(result.map(hospital => hospital.id))
      console.log(hospitalsDeactivated,"asooy")

      setError(null);
    } catch (err) {
      setError("Failed to fetch hospitals: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (actor && principal) {
      fetchHospitals(); // sekali jalan saat mount

      const interval = setInterval(fetchHospitals, 30000); // jalan tiap 30 detik
      return () => clearInterval(interval);
    }
  }, [actor, principal]);

  return (
    <HospitalContext.Provider value={{ hospitals, loading, error, fetchHospitals }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospitals = () => useContext(HospitalContext);
