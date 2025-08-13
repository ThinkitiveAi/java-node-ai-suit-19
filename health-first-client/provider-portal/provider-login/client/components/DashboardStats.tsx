import { DashboardStats as Stats } from '@shared/ehr-types';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, FileText, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: 'text-ehr-info',
      bgColor: 'bg-ehr-info/10',
    },
    {
      title: 'Pending Results',
      value: stats.pendingResults.toString(),
      icon: FileText,
      color: 'text-ehr-warning',
      bgColor: 'bg-ehr-warning/10',
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts.toString(),
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
