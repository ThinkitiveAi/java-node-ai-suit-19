import { useState } from 'react';
import EHRLayout from '@/components/EHRLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface BlockDay {
  id: string;
  date: string;
  fromTime: string;
  toTime: string;
}

const daysOfWeek = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const providers = [
  'John Doe',
  'Dr. Sarah Wilson',
  'Dr. James Rodriguez', 
  'Dr. Emily Davis',
  'Dr. Michael Brown',
  'Dr. Lisa Anderson',
];

const timezones = [
  'Eastern Standard Time',
  'Central Standard Time',
  'Mountain Standard Time',
  'Pacific Standard Time',
  'GMT',
  'UTC',
];

export default function SettingsManagement() {
  const [selectedProvider, setSelectedProvider] = useState('John Doe');
  const [selectedTimezone, setSelectedTimezone] = useState('Select Time Zone');
  
  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Tuesday', 
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Wednesday',
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Thursday',
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Friday',
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Saturday',
      enabled: true,
      slots: [{ from: '09:00 AM', to: '06:00 PM' }]
    },
    {
      day: 'Sunday',
      enabled: false,
      slots: []
    }
  ]);

  const [blockDays, setBlockDays] = useState<BlockDay[]>([
    {
      id: '1',
      date: '',
      fromTime: 'Select Start Time',
      toTime: 'Select End Time'
    }
  ]);

  const updateDayAvailability = (dayIndex: number, field: string, value: any) => {
    const newAvailability = [...availability];
    if (field === 'enabled') {
      newAvailability[dayIndex].enabled = value;
      if (!value) {
        newAvailability[dayIndex].slots = [];
      } else if (newAvailability[dayIndex].slots.length === 0) {
        newAvailability[dayIndex].slots = [{ from: '09:00 AM', to: '06:00 PM' }];
      }
    }
    setAvailability(newAvailability);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'from' | 'to', value: string) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvailability);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.splice(slotIndex, 1);
    if (newAvailability[dayIndex].slots.length === 0) {
      newAvailability[dayIndex].enabled = false;
    }
    setAvailability(newAvailability);
  };

  const addBlockDay = () => {
    const newBlockDay: BlockDay = {
      id: Date.now().toString(),
      date: '',
      fromTime: 'Select Start Time',
      toTime: 'Select End Time'
    };
    setBlockDays([...blockDays, newBlockDay]);
  };

  const updateBlockDay = (id: string, field: keyof BlockDay, value: string) => {
    setBlockDays(blockDays.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ));
  };

  const removeBlockDay = (id: string) => {
    setBlockDays(blockDays.filter(day => day.id !== id));
  };

  const timeOptions = [
    '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
    '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
  ];

  return (
    <EHRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure provider availability and system settings</p>
        </div>

        {/* Provider Availability Card */}
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200 bg-blue-50">
            <CardTitle className="text-lg font-medium text-blue-900">Provider Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Day Wise Availability */}
              <div className="col-span-7 space-y-6">
                {/* Provider Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Wise Availability */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-4 block">Day Wise Availability</Label>
                  <div className="space-y-4">
                    {availability.map((dayData, dayIndex) => (
                      <div key={dayData.day} className="grid grid-cols-12 gap-4 items-center">
                        {/* Day Name */}
                        <div className="col-span-2">
                          <Label className="text-sm text-gray-700">{dayData.day}</Label>
                        </div>
                        
                        {/* From Time */}
                        <div className="col-span-3">
                          {dayData.enabled && dayData.slots.length > 0 ? (
                            <Select 
                              value={dayData.slots[0]?.from || '09:00 AM'} 
                              onValueChange={(value) => updateTimeSlot(dayIndex, 0, 'from', value)}
                            >
                              <SelectTrigger className="border-gray-300 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-9 border border-gray-300 rounded-md bg-gray-50 flex items-center px-3">
                              <span className="text-sm text-gray-400">--:-- --</span>
                            </div>
                          )}
                        </div>

                        {/* From Icon */}
                        <div className="col-span-1 flex justify-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* To Time */}
                        <div className="col-span-3">
                          {dayData.enabled && dayData.slots.length > 0 ? (
                            <Select 
                              value={dayData.slots[0]?.to || '06:00 PM'} 
                              onValueChange={(value) => updateTimeSlot(dayIndex, 0, 'to', value)}
                            >
                              <SelectTrigger className="border-gray-300 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-9 border border-gray-300 rounded-md bg-gray-50 flex items-center px-3">
                              <span className="text-sm text-gray-400">--:-- --</span>
                            </div>
                          )}
                        </div>

                        {/* To Icon */}
                        <div className="col-span-1 flex justify-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-2 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateDayAvailability(dayIndex, 'enabled', false)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Slot Creation Setting */}
              <div className="col-span-5 space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-4 block">Slot Creation Setting</Label>
                  
                  {/* Time Zone */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Time Zone</Label>
                    <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(timezone => (
                          <SelectItem key={timezone} value={timezone}>{timezone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Block Days */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Block Days</Label>
                    <div className="space-y-3">
                      {blockDays.map((blockDay) => (
                        <div key={blockDay.id} className="grid grid-cols-12 gap-2 items-center">
                          {/* Date */}
                          <div className="col-span-3">
                            <Label className="text-xs text-gray-600 mb-1 block">Date</Label>
                            <Input
                              type="date"
                              value={blockDay.date}
                              onChange={(e) => updateBlockDay(blockDay.id, 'date', e.target.value)}
                              className="border-gray-300 text-xs h-8"
                            />
                          </div>

                          {/* From */}
                          <div className="col-span-3">
                            <Label className="text-xs text-gray-600 mb-1 block">From</Label>
                            <Select 
                              value={blockDay.fromTime} 
                              onValueChange={(value) => updateBlockDay(blockDay.id, 'fromTime', value)}
                            >
                              <SelectTrigger className="border-gray-300 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* From Icon */}
                          <div className="col-span-1 flex justify-center mt-4">
                            <Clock className="w-3 h-3 text-gray-400" />
                          </div>

                          {/* To */}
                          <div className="col-span-3">
                            <Label className="text-xs text-gray-600 mb-1 block">Till</Label>
                            <Select 
                              value={blockDay.toTime} 
                              onValueChange={(value) => updateBlockDay(blockDay.id, 'toTime', value)}
                            >
                              <SelectTrigger className="border-gray-300 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* To Icon */}
                          <div className="col-span-1 flex justify-center mt-4">
                            <Clock className="w-3 h-3 text-gray-400" />
                          </div>

                          {/* Delete */}
                          <div className="col-span-1 flex justify-center mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBlockDay(blockDay.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Block Days Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addBlockDay}
                        className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Block Days
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" className="px-6 py-2">
            Close
          </Button>
          <Button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
            Save
          </Button>
        </div>
      </div>
    </EHRLayout>
  );
}
