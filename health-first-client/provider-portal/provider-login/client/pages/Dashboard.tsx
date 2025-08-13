import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Patient, DashboardStats as Stats } from '@shared/ehr-types';
import DashboardStats from '@/components/DashboardStats';
import PatientTable from '@/components/PatientTable';
import AddPatientModal from '@/components/AddPatientModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Download, RefreshCw } from 'lucide-react';

// Sample data - in a real app this would come from an API
const sampleStats: Stats = {
  totalPatients: 1247,
  todayAppointments: 23,
  pendingResults: 8,
  criticalAlerts: 3,
};

const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    age: 34,
    gender: 'Female',
    phone: '(555) 123-4567',
    email: 'emily.johnson@email.com',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-01-22',
    status: 'Active',
    mrn: 'MRN-001234',
    insurance: 'Blue Cross Blue Shield',
    primaryPhysician: 'Dr. Sarah Wilson',
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 67,
    gender: 'Male',
    phone: '(555) 234-5678',
    email: 'michael.chen@email.com',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-25',
    status: 'Critical',
    mrn: 'MRN-001235',
    insurance: 'Medicare',
    primaryPhysician: 'Dr. James Rodriguez',
  },
  {
    id: '3',
    name: 'Sarah Williams',
    age: 28,
    gender: 'Female',
    phone: '(555) 345-6789',
    email: 'sarah.williams@email.com',
    lastVisit: '2024-01-08',
    status: 'Active',
    mrn: 'MRN-001236',
    insurance: 'Aetna',
    primaryPhysician: 'Dr. Emily Davis',
  },
  {
    id: '4',
    name: 'Robert Thompson',
    age: 52,
    gender: 'Male',
    phone: '(555) 456-7890',
    email: 'robert.thompson@email.com',
    lastVisit: '2024-01-05',
    nextAppointment: '2024-01-28',
    status: 'Active',
    mrn: 'MRN-001237',
    insurance: 'United Healthcare',
    primaryPhysician: 'Dr. Michael Brown',
  },
  {
    id: '5',
    name: 'Maria Garcia',
    age: 41,
    gender: 'Female',
    phone: '(555) 567-8901',
    email: 'maria.garcia@email.com',
    lastVisit: '2023-12-20',
    status: 'Inactive',
    mrn: 'MRN-001238',
    insurance: 'Cigna',
    primaryPhysician: 'Dr. Lisa Anderson',
  },
  {
    id: '6',
    name: 'David Lee',
    age: 39,
    gender: 'Male',
    phone: '(555) 678-9012',
    email: 'david.lee@email.com',
    lastVisit: '2024-01-12',
    nextAppointment: '2024-01-24',
    status: 'Active',
    mrn: 'MRN-001239',
    insurance: 'Kaiser Permanente',
    primaryPhysician: 'Dr. Sarah Wilson',
  },
  {
    id: '7',
    name: 'Jennifer Martinez',
    age: 55,
    gender: 'Female',
    phone: '(555) 789-0123',
    email: 'jennifer.martinez@email.com',
    lastVisit: '2024-01-14',
    nextAppointment: '2024-01-26',
    status: 'Critical',
    mrn: 'MRN-001240',
    insurance: 'Humana',
    primaryPhysician: 'Dr. James Rodriguez',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats>(sampleStats);
  const [loading, setLoading] = useState(true);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPatients(samplePatients);
      setStats(sampleStats);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleAddPatient = (newPatientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...newPatientData,
      id: Date.now().toString()
    };
    setPatients([...patients, newPatient]);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalPatients: prev.totalPatients + 1
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddPatientModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={stats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-ehr-success rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Lab results reviewed for Emily Johnson</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-ehr-info rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Appointment scheduled for David Lee</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-ehr-warning rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Critical alert for Michael Chen</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">New patient registered: Jennifer Martinez</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">EJ</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Emily Johnson</p>
                    <p className="text-sm text-muted-foreground">Follow-up consultation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">9:00 AM</p>
                  <Badge variant="secondary" className="text-xs bg-ehr-success/10 text-ehr-success">
                    Confirmed
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-ehr-warning/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-ehr-warning">MC</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Emergency consultation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">10:30 AM</p>
                  <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive">
                    Urgent
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-ehr-info/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-ehr-info">DL</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">David Lee</p>
                    <p className="text-sm text-muted-foreground">Regular checkup</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">2:00 PM</p>
                  <Badge variant="secondary" className="text-xs bg-ehr-success/10 text-ehr-success">
                    Confirmed
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Patients</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            </div>
          ) : (
            <PatientTable patients={patients} />
          )}
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}
