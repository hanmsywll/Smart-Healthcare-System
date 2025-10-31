import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Option "mo:base/Option";

actor MedicalCanister {

  // Hospital baru
  type Hospital = {
    id: Nat;
    name: Text;
    logoURL: Text;
    walletAddress: Principal;
    isActive: Bool;
    createdAt: Int; //New
    updatedAt: Int;
    expiredAt: ?Int; 
  };

  type Profile = {
    id:Nat;
    name:Text;
    walletAddress: Principal;
    photoURL:Text;
    address:Text;    
  };

  type Doctor = {
    id: Nat;
    hospitalId: Nat;
    name: Text;
    specialty: Text;
    walletAddress: Principal;
    photoURL: Text;
    isActive: Bool;
  };

  // New: Doctor Schedule Type
  type DoctorSchedule = {
    id: Nat;
    doctorId: Nat;
    dayOfWeek: Nat; // 0 = Sunday, 1 = Monday, etc.
    startTime: Text; // Format: "08:00"
    endTime: Text;   // Format: "17:00"
    isAvailable: Bool;
  };

  // New: Prescription Type (embedded in MedicalRecord)
  type Prescription = {
    medicationName: Text;
    dosage: Text;
    frequency: Text; // e.g., "3x sehari"
    duration: Text;  // e.g., "7 hari"
    instructions: Text; // e.g., "Diminum setelah makan"
  };

  // Enhanced: MedicalRecord with Prescription
  type MedicalRecord = {
    id: Nat;
    patientId: Nat;
    doctorId: Nat;
    hospitalId: Nat;
    diagnosis: Text;
    cpptURL: Text;
    evidenceURLs: [Text];
    prescriptions: [Prescription]; // New: Array of prescriptions
    createdAt: Int;
  };

  stable var hospitals : [Hospital] = []; // New version
  stable var doctors: [Doctor] = [];
  stable var profiles: [Profile] = [];
  stable var medicalRecords: [MedicalRecord] = [];
  stable var doctorSchedules: [DoctorSchedule] = []; // New
  stable var migrationCompleted : Bool = false;

  stable var hospitalCounter: Nat = 0;
  stable var profileCounter: Nat = 0; // New
  stable var doctorCounter: Nat = 0;
  stable var recordCounter: Nat = 0;
  stable var scheduleCounter: Nat = 0; // New

  // Existing hospital functions...
  public shared({caller}) func registerHospital(name: Text, logoURL: Text,plan:Text) : async Text { //for testing
    // Duration Day null == lifetime
    hospitalCounter += 1;
    let nowInSec = Time.now() / 1_000_000_000; // second
    let expiredAt : ?Int = switch (plan) {
      case ("trial") { ?(nowInSec + 3 * 86_400) }; // 3 Days
      case ("monthly") { ?(nowInSec + 30 * 86_400) }; // 30 days / a month
      case ("yearly") { ?(nowInSec + 365 * 86_400) }; // 365 days / a year
      case ("lifetime") { null }; // forever
      case (_) { null }; // default fallback
    };
    let newHospital : Hospital = {
      id = hospitalCounter;
      name = name;
      logoURL = logoURL;
      walletAddress = caller;
      isActive = true;
      createdAt = nowInSec; // New
      updatedAt = nowInSec;
      expiredAt;
    };
    hospitals := Array.append(hospitals, [newHospital]);
    return "Hospital registered with ID: " # Nat.toText(newHospital.id);
  };

  // Toggle active status for single hospital
  public shared({caller}) func toggleHospitalActiveStatus(hospitalId: Nat, plan: Text) : async Text {
    let nowInSec = Time.now() / 1_000_000_000;
    var toggled = false;

    hospitals := Array.map<Hospital, Hospital>(hospitals, func (h) {
      if (h.id == hospitalId and h.walletAddress == caller) {
        toggled := true;

        // Tentukan status baru
        let newIsActive = not h.isActive;

        // Kalau aktif → hitung expiredAt pakai plan dari parameter
        let newExpiredAt : ?Int =
          if (newIsActive) {
            switch (plan) {
              case ("monthly") { ?(nowInSec + 30 * 86_400) }; // 30 hari
              case ("yearly") { ?(nowInSec + 365 * 86_400) }; // 365 hari
              case ("lifetime") { null }; // selamanya
              case (_) { null }; // fallback
            }
          } else {
            null
          };

        { h with 
          isActive = newIsActive;
          updatedAt = nowInSec;
          expiredAt = newExpiredAt
        }
      } else {
        h
      }
    });

    if (toggled) {
      return "Hospital status toggled successfully";
    } else {
      return "Unauthorized or hospital not found";
    }
  };

  // Extend Hospital
  public shared({caller}) func extendHospital(hospitalId: Nat, plan: Text) : async Text {
    let nowInSec = Time.now() / 1_000_000_000;

    var found = false;

    hospitals := Array.map<Hospital, Hospital>(hospitals, func (h) {
      if (h.id == hospitalId and h.walletAddress == caller) {
        found := true;

        // Tentukan durasi tambahan
        if (plan == "lifetime") {
          { h with updatedAt = nowInSec; expiredAt = null }
        } else {
          let extendTime =
            switch (plan) {
              case ("monthly") { 30 * 86_400 }; // 30 hari
              case ("yearly") { 365 * 86_400 }; // 365 hari
              case (_) { -1 }; // invalid
            };

          if (extendTime < 0) {
            // kalau plan invalid, jangan ubah data
            h
          } else {
            // unwrap expiredAt
            let old = Option.get(h.expiredAt, nowInSec);
            let newExpired = Int.max(old, nowInSec) + extendTime;
            { h with updatedAt = nowInSec; expiredAt = ?newExpired }
          }
        }
      } else {
        h
      }
    });

    if (not found) {
      return "Error: hospital not found or caller is not the owner";
    };

    if (plan != "monthly" and plan != "yearly" and plan != "lifetime") {
      return "Error: invalid subscription plan '" # plan # "'";
    };

    return "Hospital subscription extended successfully";
  };

  // Deactivate hospital if expired (only hospital owner can trigger)
  public shared({caller}) func deactivateHospitalIfExpired(id: Nat) : async Bool {
    let nowInSec : Int = Time.now() / 1_000_000_000;
    var found : Bool = false;

    hospitals := Array.map<Hospital, Hospital>(hospitals, func (h) {
      if (h.id == id and h.walletAddress == caller) {
        switch (h.expiredAt) {
          case (null) { 
            h   // lifetime, tidak perlu update 
          };
          case (?exp) {
            if (exp < nowInSec) {
              found := true;
              { h with isActive = false }
            } else {
              h
            }
          };
        }
      } else {
        h
      }
    });

    return found;
  };

  // Deactivate hospitals in batch if expired (only owner can trigger)
  public shared({caller}) func deactivateHospitalsIfExpired(ids: [Nat]) : async [Nat] {
    let nowInSec : Int = Time.now() / 1_000_000_000;
    var deactivated : [Nat] = [];

    hospitals := Array.map<Hospital, Hospital>(hospitals, func (h) {
      if (Array.find<Nat>(ids, func (id) { id == h.id }) != null
          and h.walletAddress == caller) {
        switch (h.expiredAt) {
          case (null) { h };
          case (?exp) {
            if (exp < nowInSec) {
              deactivated := Array.append<Nat>(deactivated, [h.id]);
              { h with isActive = false }
            } else {
              h
            }
          };
        }
      } else {
        h
      }
    });

    return deactivated; // return the hospital id
  };


  // Existing doctor functions...
  public shared({caller}) func registerDoctor(hospitalId: Nat, name: Text, specialty: Text, photoURL: Text, doctorWallet: Principal) : async Text {
    let isAuthorized = Array.find<Hospital>(hospitals, func (h) : Bool { h.id == hospitalId and h.walletAddress == caller });
    if (isAuthorized == null) {
      return "Unauthorized: Only hospital owner can register doctor";
    };
    doctorCounter += 1;
    let newDoctor : Doctor = {
      id = doctorCounter;
      hospitalId = hospitalId;
      name = name;
      specialty = specialty;
      walletAddress = doctorWallet;
      photoURL = photoURL;
      isActive = true;
    };
    doctors := Array.append(doctors, [newDoctor]);
    return "Doctor registered with ID: " # Nat.toText(newDoctor.id);
  };

  public shared({caller}) func deactivateDoctor(doctorId: Nat) : async Text {
    let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { d.id == doctorId });
    switch (doctorOpt) {
      case null return "Doctor not found";
      case (?doctor) {
        let isAuthorized = Array.find<Hospital>(hospitals, func (h) : Bool { h.id == doctor.hospitalId and h.walletAddress == caller });
        if (isAuthorized == null) {
          return "Unauthorized: Only hospital owner can deactivate doctor";
        };
        doctors := Array.map<Doctor, Doctor>(doctors, func (d) : Doctor {
          if (d.id == doctorId) { { d with isActive = false } } else { d }
        });
        return "Doctor deactivated";
      }
    }
  };

  // NEW: Doctor Schedule Functions
  public shared({caller}) func addDoctorSchedule(
    doctorId: Nat, 
    dayOfWeek: Nat, 
    startTime: Text, 
    endTime: Text
  ) : async Text {
    // Verify caller is the doctor or hospital owner
    let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { d.id == doctorId });
    switch (doctorOpt) {
      case null return "Doctor not found";
      case (?doctor) {
        let isDoctor = doctor.walletAddress == caller;
        let isHospitalOwner = Array.find<Hospital>(hospitals, func (h) : Bool { 
          h.id == doctor.hospitalId and h.walletAddress == caller 
        }) != null;
        
        if (not isDoctor and not isHospitalOwner) {
          return "Unauthorized: Only doctor or hospital owner can add schedule";
        };

        // Validate day of week (0-6)
        if (dayOfWeek > 6) {
          return "Invalid day of week. Use 0-6 (0=Sunday)";
        };

        scheduleCounter += 1;
        let newSchedule : DoctorSchedule = {
          id = scheduleCounter;
          doctorId = doctorId;
          dayOfWeek = dayOfWeek;
          startTime = startTime;
          endTime = endTime;
          isAvailable = true;
        };
        doctorSchedules := Array.append(doctorSchedules, [newSchedule]);
        return "Schedule added with ID: " # Nat.toText(newSchedule.id);
      }
    }
  };

  public shared({caller}) func updateDoctorSchedule(
    scheduleId: Nat, 
    startTime: Text, 
    endTime: Text, 
    isAvailable: Bool
  ) : async Text {
    let scheduleOpt = Array.find<DoctorSchedule>(doctorSchedules, func (s) : Bool { s.id == scheduleId });
    switch (scheduleOpt) {
      case null return "Schedule not found";
      case (?schedule) {
        let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { d.id == schedule.doctorId });
        switch (doctorOpt) {
          case null return "Doctor not found";
          case (?doctor) {
            let isDoctor = doctor.walletAddress == caller;
            let isHospitalOwner = Array.find<Hospital>(hospitals, func (h) : Bool { 
              h.id == doctor.hospitalId and h.walletAddress == caller 
            }) != null;
            
            if (not isDoctor and not isHospitalOwner) {
              return "Unauthorized: Only doctor or hospital owner can update schedule";
            };

            doctorSchedules := Array.map<DoctorSchedule, DoctorSchedule>(doctorSchedules, func (s) : DoctorSchedule {
              if (s.id == scheduleId) {
                { s with startTime = startTime; endTime = endTime; isAvailable = isAvailable }
              } else { s }
            });
            return "Schedule updated";
          }
        }
      }
    }
  };

  // Enhanced: Medical Record with Prescriptions
  public shared({caller}) func addMedicalRecord(
    patientId: Nat, 
    hospitalId: Nat, 
    diagnosis: Text, 
    cpptURL: Text, 
    evidenceURLs: [Text],
    prescriptions: [Prescription]
  ) : async Text {
    let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { 
      d.walletAddress == caller and d.hospitalId == hospitalId and d.isActive 
    });
    switch (doctorOpt) {
      case null return "Unauthorized: You are not an active doctor in this hospital";
      case (?doctor) {
        recordCounter += 1;
        let newRecord : MedicalRecord = {
          id = recordCounter;
          patientId = patientId;
          doctorId = doctor.id;
          hospitalId = hospitalId;
          diagnosis = diagnosis;
          cpptURL = cpptURL;
          evidenceURLs = evidenceURLs;
          prescriptions = prescriptions;
          createdAt = Time.now() / 1_000_000_000; //seconds
        };
        medicalRecords := Array.append(medicalRecords, [newRecord]);
        return "Medical record added with ID: " # Nat.toText(newRecord.id);
      }
    }
  };

  // NEW: Update prescriptions in existing medical record
  public shared({caller}) func updatePrescriptions(recordId: Nat, prescriptions: [Prescription]) : async Text {
    let recordOpt = Array.find<MedicalRecord>(medicalRecords, func (r) : Bool { r.id == recordId });
    switch (recordOpt) {
      case null return "Medical record not found";
      case (?record) {
        let doctorOpt = Array.find<Doctor>(doctors, func (d) : Bool { 
          d.id == record.doctorId and d.walletAddress == caller 
        });
        if (doctorOpt == null) {
          return "Unauthorized: Only the attending doctor can update prescriptions";
        };

        medicalRecords := Array.map<MedicalRecord, MedicalRecord>(medicalRecords, func (r) : MedicalRecord {
          if (r.id == recordId) {
            { r with prescriptions = prescriptions }
          } else { r }
        });
        return "Prescriptions updated for record ID: " # Nat.toText(recordId);
      }
    }
  };

  // Query functions
  
  // Hospital Query
  public query func getHospitals() : async [Hospital] {
    hospitals;
  };

  public query func getDoctors() : async [Doctor] {
    doctors;
  };

  public query({caller}) func getHospitalsByPrincipal() : async [Hospital] { 
    Array.filter<Hospital>(hospitals,func(h){h.walletAddress == caller});
  };

  public query({caller}) func getDoctorsByPrincipal() : async [Doctor] {
    let hospitalsId = Array.map<Hospital,Nat>(
      Array.filter<Hospital>(hospitals,func(h){h.walletAddress == caller}),
      func(h){h.id}
    ); //get all hospital according to principal and get only the ID

    Array.filter<Doctor>(doctors,func(d){
      Array.find<Nat>(hospitalsId, func(hId){hId == d.hospitalId}) != null
    }) //get all the doctors according to hospital Id from the hospitalsId
  }; 

  public query func getMedicalRecordsByPatient(patientId: Nat) : async [MedicalRecord] {
    Array.filter<MedicalRecord>(medicalRecords, func (r) : Bool { r.patientId == patientId });
  };

  // New : Get medical record according to the hospitalID(support pagination)
  public query func getMedicalRecordsByHospitalPaged(hospitalId: Nat, page: Nat, pageSize: Nat) : async [MedicalRecord] {
    let filtered = Array.filter<MedicalRecord>(medicalRecords, func (r) : Bool { r.hospitalId == hospitalId });
    let start = page * pageSize;
    
    if (start >= Array.size(filtered)) {
      return [];
    };

    let end = start + pageSize;
    let safeEnd = if (end > Array.size(filtered)) Array.size(filtered) else end;

    return Array.subArray<MedicalRecord>(filtered, start, safeEnd);
  };

  // NEW: Get doctor schedule
  public query func getDoctorSchedule(doctorId: Nat) : async [DoctorSchedule] {
    Array.filter<DoctorSchedule>(doctorSchedules, func (s) : Bool { s.doctorId == doctorId });
  };

  // NEW: Get available doctors by day and hospital
  public query func getAvailableDoctors(hospitalId: Nat, dayOfWeek: Nat) : async [Doctor] {
    let hospitalDoctors = Array.filter<Doctor>(doctors, func (d) : Bool { 
      d.hospitalId == hospitalId and d.isActive 
    });
    
    Array.filter<Doctor>(hospitalDoctors, func (d) : Bool {
      let schedules = Array.filter<DoctorSchedule>(doctorSchedules, func (s) : Bool {
        s.doctorId == d.id and s.dayOfWeek == dayOfWeek and s.isAvailable
      });
      Array.size(schedules) > 0
    });
  };

  // NEW: Get prescriptions by patient (from all medical records)
  public query func getPrescriptionsByPatient(patientId: Nat) : async [(Nat, [Prescription])] {
    let patientRecords = Array.filter<MedicalRecord>(medicalRecords, func (r) : Bool { 
      r.patientId == patientId 
    });
    
    Array.map<MedicalRecord, (Nat, [Prescription])>(patientRecords, func (r) : (Nat, [Prescription]) {
      (r.id, r.prescriptions)
    });
  };

  // NEW: Get doctor's patients count
  public query func getDoctorPatientsCount(doctorId: Nat) : async Nat {
    let doctorRecords = Array.filter<MedicalRecord>(medicalRecords, func (r) : Bool { 
      r.doctorId == doctorId 
    });
    
    // Get unique patient IDs
    let patientIds = Array.map<MedicalRecord, Nat>(doctorRecords, func (r) : Nat { r.patientId });
    // Note: This doesn't remove duplicates, but gives total records count
    Array.size(patientIds);
  };

};