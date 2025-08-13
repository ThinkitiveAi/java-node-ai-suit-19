import { useState, useMemo } from 'react';
import EHRLayout from '@/components/EHRLayout';
import PatientTable from '@/components/PatientTable';
import AddPatientModal from '@/components/AddPatientModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  Phone,
  Mail,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { Patient } from '@shared/ehr-types';
import { Link } from 'react-router-dom';

// Extended sample patient data
const allPatients: Patient[] = [
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
  {
    id: '8',
    name: 'Christopher Anderson',
    age: 45,
    gender: 'Male',
    phone: '(555) 890-1234',
    email: 'chris.anderson@email.com',
    lastVisit: '2024-01-11',
    nextAppointment: '2024-01-23',
    status: 'Active',
    mrn: 'MRN-001241',
    insurance: 'Blue Cross Blue Shield',
    primaryPhysician: 'Dr. Emily Davis',
  },
  {
    id: '9',
    name: 'Amanda Rodriguez',
    age: 31,
    gender: 'Female',
    phone: '(555) 901-2345',
    email: 'amanda.rodriguez@email.com',
    lastVisit: '2024-01-09',
    status: 'Active',
    mrn: 'MRN-001242',
    insurance: 'Aetna',
    primaryPhysician: 'Dr. Michael Brown',
  },
  {
    id: '10',
    name: 'James Wilson',
    age: 62,
    gender: 'Male',
    phone: '(555) 012-3456',
    email: 'james.wilson@email.com',
    lastVisit: '2024-01-07',
    nextAppointment: '2024-01-29',
    status: 'Active',
    mrn: 'MRN-001243',
    insurance: 'Medicare',
    primaryPhysician: 'Dr. Lisa Anderson',
  },
];

type ViewMode = 'list' | 'grid';

export default function PatientsManagement() {
  const [patients, setPatients] = useState<Patient[]>(allPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || patient.status.toLowerCase() === statusFilter;
      const matchesGender = genderFilter === 'all' || patient.gender.toLowerCase() === genderFilter;
      
      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [patients, searchTerm, statusFilter, genderFilter]);

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-ehr-success/10 text-ehr-success';
      case 'Critical':
        return 'bg-destructive/10 text-destructive';
      case 'Inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleAddPatient = (newPatientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...newPatientData,
      id: Date.now().toString()
    };
    setPatients([...patients, newPatient]);
  };

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <Link to={`/patient/${patient.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">MRN: {patient.mrn}</p>
              </div>
            </div>
            <Badge className={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{patient.age} years, {patient.gender}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last visit: {patient.lastVisit}</span>
            </div>
            {patient.nextAppointment && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Next: {patient.nextAppointment}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Physician:</span> {patient.primaryPhysician}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Insurance:</span> {patient.insurance}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <EHRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
            <p className="text-muted-foreground">
              Manage and view all patient records ({filteredPatients.length} patients)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAddPatientModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, MRN, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gender</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-ehr-success rounded-full"></div>
              <span>Active ({patients.filter(p => p.status === 'Active').length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Critical ({patients.filter(p => p.status === 'Critical').length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span>Inactive ({patients.filter(p => p.status === 'Inactive').length})</span>
            </div>
          </div>
        </div>

        {/* Patient List/Grid */}
        {viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <PatientTable patients={filteredPatients} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                No patients match your current search criteria. Try adjusting your filters.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setGenderFilter('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Patient Modal */}
        <AddPatientModal
          isOpen={isAddPatientModalOpen}
          onClose={() => setIsAddPatientModalOpen(false)}
          onAddPatient={handleAddPatient}
        />
      </div>
    </EHRLayout>
  );
}
