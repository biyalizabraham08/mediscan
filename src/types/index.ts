export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type AllergySeverity = 'Mild' | 'Severe' | 'Life-threatening';
export type AccessTier = 'public' | 'extended';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: AllergySeverity;
  reaction?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface Condition {
  id: string;
  name: string;
  diagnosedYear?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalProfile {
  userId: string;
  email: string;
  // Basic Info
  fullName: string;
  dateOfBirth: string;
  bloodGroup: BloodGroup | '';
  height: string; // cm
  weight: string; // kg
  // Medical Data
  allergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface PublicEmergencyInfo {
  fullName: string;
  age: number;
  bloodGroup: BloodGroup | '';
  severeAllergies: Allergy[];
  primaryEmergencyContact: EmergencyContact | null;
}

export interface ExtendedEmergencyInfo extends PublicEmergencyInfo {
  dateOfBirth: string;
  height: string;
  weight: string;
  allAllergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  allEmergencyContacts: EmergencyContact[];
}

export interface AccessLog {
  id: string;
  accessedAt: string;
  accessorType: string; // 'emergency_scan' | 'doctor_access'
  accessTier: AccessTier;
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
