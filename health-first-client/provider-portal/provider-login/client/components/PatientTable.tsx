import { Patient } from '@shared/ehr-types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-ehr-success/10 text-ehr-success hover:bg-ehr-success/20';
      case 'Critical':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'Inactive':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const handleRowClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-ehr-table-header border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Patient</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">MRN</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Age/Gender</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Contact</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Last Visit</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Next Appointment</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Physician</th>
              <th className="w-10 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                onClick={() => handleRowClick(patient.id)}
                className={cn(
                  "border-b border-border hover:bg-ehr-table-row-hover transition-colors cursor-pointer",
                  index % 2 === 0 ? "bg-white" : "bg-muted/30"
                )}
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-foreground">{patient.name}</div>
                  <div className="text-sm text-muted-foreground">{patient.insurance}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-foreground">{patient.mrn}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-foreground">{patient.age} years</div>
                  <div className="text-sm text-muted-foreground">{patient.gender}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mt-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground truncate max-w-32">{patient.email}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{patient.lastVisit}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {patient.nextAppointment ? (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground">{patient.nextAppointment}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No upcoming</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getStatusColor(patient.status))}
                  >
                    {patient.status}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-foreground">{patient.primaryPhysician}</span>
                </td>
                <td className="py-4 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
