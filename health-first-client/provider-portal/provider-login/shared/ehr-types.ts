export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'Active' | 'Inactive' | 'Critical';
  mrn: string; // Medical Record Number
  insurance: string;
  primaryPhysician: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Procedure' | 'Checkup' | 'Specialist';
  status: 'Scheduled' | 'Checked In' | 'In Exam' | 'Completed' | 'Cancelled';
  physician: string;
  provider: string;
  mode: 'In-Person' | 'Video Call' | 'Home';
  estimatedAmount?: number;
  reasonForVisit?: string;
  notes?: string;
}

export interface AppointmentFormData {
  patientId: string;
  patientName: string;
  mode: 'In-Person' | 'Video Call' | 'Home';
  provider: string;
  appointmentType: string;
  estimatedAmount: string;
  date: string;
  time: string;
  reasonForVisit: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'Diagnosis' | 'Treatment' | 'Lab Result' | 'Prescription' | 'Note';
  title: string;
  description: string;
  physician: string;
  attachments?: string[];
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  result: string;
  normalRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  date: string;
  orderedBy: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingResults: number;
  criticalAlerts: number;
}
