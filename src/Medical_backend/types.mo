import Nat "mo:base/Nat";
import Int "mo:base/Int";

module {
  public type Timestamp = Int; // unix time dalam detik
  // Hospital baru
  public type Hospital = {
    id: Nat;
    name: Text;
    logoURL: Text;
    walletAddress: Principal;
    isActive: Bool;
    createdAt: Timestamp; //New
    updatedAt: Timestamp;
    expiredAt: ?Timestamp; 
  };

  public type Profile = {
    id:Nat;
    name:Text;
    walletAddress: Principal;
    photoURL:Text;
    address:Text;    
  };

  public type Doctor = {
    id: Nat;
    hospitalId: Nat;
    name: Text;
    specialty: Text;
    walletAddress: Principal;
    photoURL: Text;
    isActive: Bool;
  };

  // New: Doctor Schedule Type
  public type DoctorSchedule = {
    id: Nat;
    doctorId: Nat;
    dayOfWeek: Nat; // 0 = Sunday, 1 = Monday, etc.
    startTime: Text; // Format: "08:00"
    endTime: Text;   // Format: "17:00"
    isAvailable: Bool;
  };

  // New: Prescription Type (embedded in MedicalRecord)
  public type Prescription = {
    medicationName: Text;
    dosage: Text;
    frequency: Text; // e.g., "3x sehari"
    duration: Text;  // e.g., "7 hari"
    instructions: Text; // e.g., "Diminum setelah makan"
  };

  // Enhanced: MedicalRecord with Prescription
  public type MedicalRecord = {
    id: Nat;
    patientId: Nat;
    doctorId: Nat;
    hospitalId: Nat;
    diagnosis: Text;
    cpptURL: Text;
    evidenceURLs: [Text];
    prescriptions: [Prescription]; // New: Array of prescriptions
    createdAt: Timestamp;
  };

}