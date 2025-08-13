import { useState, useMemo } from 'react';
import EHRLayout from '@/components/EHRLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Home,
  MapPin,
  RefreshCw,
  Filter,
  Download,
  Play,
  Edit,
  X
} from 'lucide-react';
import { Appointment, AppointmentFormData } from '@shared/ehr-types';
import { cn } from '@/lib/utils';

// Sample appointment data
const sampleAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Emily Johnson',
    date: '2024-01-22',
    time: '09:00 AM',
    type: 'Consultation',
    status: 'Scheduled',
    physician: 'Dr. Sarah Wilson',
    provider: 'Dr. Sarah Wilson',
    mode: 'In-Person',
    estimatedAmount: 150,
    reasonForVisit: 'Regular checkup',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Michael Chen',
    date: '2024-01-22',
    time: '10:30 AM',
    type: 'Emergency',
    status: 'Checked In',
    physician: 'Dr. James Rodriguez',
    provider: 'Dr. James Rodriguez',
    mode: 'In-Person',
    estimatedAmount: 300,
    reasonForVisit: 'Chest pain evaluation',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Sarah Williams',
    date: '2024-01-22',
    time: '11:00 AM',
    type: 'Follow-up',
    status: 'In Exam',
    physician: 'Dr. Emily Davis',
    provider: 'Dr. Emily Davis',
    mode: 'Video Call',
    estimatedAmount: 100,
    reasonForVisit: 'Follow-up on medication',
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Robert Thompson',
    date: '2024-01-22',
    time: '02:00 PM',
    type: 'Consultation',
    status: 'Scheduled',
    physician: 'Dr. Michael Brown',
    provider: 'Dr. Michael Brown',
    mode: 'In-Person',
    estimatedAmount: 175,
    reasonForVisit: 'Annual physical',
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Maria Garcia',
    date: '2024-01-22',
    time: '03:30 PM',
    type: 'Procedure',
    status: 'Cancelled',
    physician: 'Dr. Lisa Anderson',
    provider: 'Dr. Lisa Anderson',
    mode: 'In-Person',
    estimatedAmount: 450,
    reasonForVisit: 'Minor surgery',
  },
  {
    id: '6',
    patientId: '6',
    patientName: 'David Lee',
    date: '2024-01-23',
    time: '09:30 AM',
    type: 'Checkup',
    status: 'Scheduled',
    physician: 'Dr. Sarah Wilson',
    provider: 'Dr. Sarah Wilson',
    mode: 'Home',
    estimatedAmount: 200,
    reasonForVisit: 'Home visit for elderly care',
  },
];

const providers = [
  'Dr. Sarah Wilson',
  'Dr. James Rodriguez', 
  'Dr. Emily Davis',
  'Dr. Michael Brown',
  'Dr. Lisa Anderson',
];

const appointmentTypes = [
  'Consultation',
  'Follow-up',
  'Emergency',
  'Procedure',
  'Checkup',
  'Specialist',
];

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    patientName: '',
    mode: 'In-Person',
    provider: '',
    appointmentType: '',
    estimatedAmount: '',
    date: '',
    time: '',
    reasonForVisit: '',
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.physician.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase().replace(' ', '') === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Checked In':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'In Exam':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModeIcon = (mode: Appointment['mode']) => {
    switch (mode) {
      case 'Video Call':
        return <Video className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const handleScheduleAppointment = () => {
    // Here you would typically make an API call
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: formData.patientName,
      date: formData.date,
      time: formData.time,
      type: formData.appointmentType as any,
      status: 'Scheduled',
      physician: formData.provider,
      provider: formData.provider,
      mode: formData.mode,
      estimatedAmount: parseFloat(formData.estimatedAmount) || 0,
      reasonForVisit: formData.reasonForVisit,
    };

    setAppointments([...appointments, newAppointment]);
    setIsScheduleModalOpen(false);
    setFormData({
      patientId: '',
      patientName: '',
      mode: 'In-Person',
      provider: '',
      appointmentType: '',
      estimatedAmount: '',
      date: '',
      time: '',
      reasonForVisit: '',
    });
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleStartAppointment = (appointmentId: string) => {
    handleStatusChange(appointmentId, 'In Exam');
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <EHRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">
              Manage patient appointments and schedules ({filteredAppointments.length} appointments)
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
            <Button size="sm" onClick={() => setIsScheduleModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
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
                  placeholder="Search appointments by patient or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="checkedin">Checked In</SelectItem>
                    <SelectItem value="inexam">In Exam</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Scheduled', 'Checked In', 'In Exam', 'Completed', 'Cancelled'].map((status) => {
            const count = appointments.filter(apt => apt.status === status).length;
            return (
              <Card key={status} className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground">{status}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Provider</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Mode</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => (
                    <tr 
                      key={appointment.id}
                      className={cn(
                        "border-b border-border hover:bg-muted/30 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-muted/10"
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-foreground">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.reasonForVisit}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{appointment.time}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{appointment.date}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">{appointment.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{appointment.provider}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getModeIcon(appointment.mode)}
                          <span className="text-sm text-foreground">{appointment.mode}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn("text-xs border", getStatusColor(appointment.status))}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'Scheduled' || appointment.status === 'Checked In' ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleStartAppointment(appointment.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          ) : null}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="px-3 py-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Schedule New Appointment Modal */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="max-w-2xl bg-white p-0 rounded-lg overflow-hidden">
            <DialogHeader className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-medium text-gray-900">
                  Schedule New Appointment
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="px-6 py-6 space-y-6">
              {/* Patient Name */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Patient Name</Label>
                <Select 
                  value={formData.patientName} 
                  onValueChange={(value) => setFormData({ ...formData, patientName: value, patientId: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Search & Select Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emily Johnson">Emily Johnson</SelectItem>
                    <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                    <SelectItem value="Sarah Williams">Sarah Williams</SelectItem>
                    <SelectItem value="Robert Thompson">Robert Thompson</SelectItem>
                    <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appointment Mode */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Appointment Mode</Label>
                <RadioGroup 
                  value={formData.mode} 
                  onValueChange={(value: any) => setFormData({ ...formData, mode: value })}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="In-Person" id="in-person" />
                    <Label htmlFor="in-person" className="text-sm">In-Person</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Video Call" id="video-call" />
                    <Label htmlFor="video-call" className="text-sm">Video Call</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Home" id="home" />
                    <Label htmlFor="home" className="text-sm">Home</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Provider */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Provider</Label>
                  <Select 
                    value={formData.provider} 
                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Search Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointment Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Appointment Type</Label>
                  <Select 
                    value={formData.appointmentType} 
                    onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Estimated Amount */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">
                    Estimated Amount ($)
                  </Label>
                  <Input
                    value={formData.estimatedAmount}
                    onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                    placeholder="Enter Amount"
                    className="border-gray-300"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Date & Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="border-gray-300 flex-1"
                    />
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="border-gray-300 flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Reason for Visit</Label>
                <Textarea
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  placeholder="Enter Reason"
                  className="border-gray-300 min-h-20"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleAppointment}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EHRLayout>
  );
}
