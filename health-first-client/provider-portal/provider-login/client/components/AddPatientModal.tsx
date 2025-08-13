import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X, Upload } from 'lucide-react';
import { Patient } from '@shared/ehr-types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
}

interface PatientFormData {
  profilePicture?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  timezone: string;
  language: string;
  ssn: string;
  race: string;
  ethnicity: string;
  phone: string;
  email: string;
  insurance: string;
  primaryPhysician: string;
}

const genderOptions = ['Male', 'Female', 'Other'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const timezoneOptions = [
  'Eastern Standard Time',
  'Central Standard Time', 
  'Mountain Standard Time',
  'Pacific Standard Time',
  'Alaska Standard Time',
  'Hawaii Standard Time'
];
const languageOptions = [
  'English (US)',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean'
];
const raceOptions = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other',
  'Decline to Answer'
];
const ethnicityOptions = [
  'Hispanic or Latino',
  'Not Hispanic or Latino',
  'Central American',
  'South American',
  'Caribbean',
  'Other',
  'Decline to Answer'
];
const insuranceOptions = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'United Healthcare',
  'Kaiser Permanente',
  'Humana',
  'Medicare',
  'Medicaid',
  'Self-Pay'
];
const physicianOptions = [
  'Dr. Sarah Wilson',
  'Dr. James Rodriguez',
  'Dr. Emily Davis',
  'Dr. Michael Brown',
  'Dr. Lisa Anderson'
];

export default function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    profilePicture: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    timezone: '',
    language: '',
    ssn: '',
    race: '',
    ethnicity: '',
    phone: '',
    email: '',
    insurance: '',
    primaryPhysician: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First Name is required';
    if (!formData.lastName.trim()) return 'Last Name is required';
    if (!formData.dateOfBirth) return 'Date of Birth is required';
    if (!formData.gender) return 'Gender is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email address';
    if (!formData.insurance) return 'Insurance is required';
    if (!formData.primaryPhysician) return 'Primary Physician is required';
    
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate age from date of birth
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

      // Generate MRN
      const mrn = `MRN-${Date.now().toString().slice(-6)}`;

      const newPatient: Omit<Patient, 'id'> = {
        name: `${formData.firstName} ${formData.lastName}`,
        age,
        gender: formData.gender as Patient['gender'],
        phone: formData.phone,
        email: formData.email,
        lastVisit: new Date().toISOString().split('T')[0], // Today's date
        status: 'Active' as Patient['status'],
        mrn,
        insurance: formData.insurance,
        primaryPhysician: formData.primaryPhysician
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAddPatient(newPatient);
      
      // Reset form
      setFormData({
        profilePicture: '',
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        timezone: '',
        language: '',
        ssn: '',
        race: '',
        ethnicity: '',
        phone: '',
        email: '',
        insurance: '',
        primaryPhysician: ''
      });
      
      onClose();
    } catch (err) {
      setError('Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      profilePicture: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      timezone: '',
      language: '',
      ssn: '',
      race: '',
      ethnicity: '',
      phone: '',
      email: '',
      insurance: '',
      primaryPhysician: ''
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white p-0 rounded-lg overflow-hidden">
        {/* Header */}
        <DialogHeader className="border-b border-gray-200 px-6 py-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-blue-900">Add Patient</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Demographics Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
            
            <div className="grid grid-cols-12 gap-6">
              {/* Profile Picture */}
              <div className="col-span-3">
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Profile Picture</Label>
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    {formData.profilePicture ? (
                      <img 
                        src={formData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="cursor-pointer border-dashed border-gray-300 text-gray-600 hover:border-gray-400"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="col-span-9">
                <div className="grid grid-cols-3 gap-4">
                  {/* First Row */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter Name"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Middle Name</Label>
                    <Input
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      placeholder="Enter Middle Name"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter Last Name"
                      className="border-gray-300"
                    />
                  </div>

                  {/* Second Row */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Date Of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Marital Status</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Third Row */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">SSN</Label>
                    <Input
                      value={formData.ssn}
                      onChange={(e) => handleInputChange('ssn', e.target.value)}
                      placeholder="Enter SSN"
                      className="border-gray-300"
                    />
                  </div>

                  {/* Fourth Row */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Race</Label>
                    <Select value={formData.race} onValueChange={(value) => handleInputChange('race', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Race" />
                      </SelectTrigger>
                      <SelectContent>
                        {raceOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Ethnicity</Label>
                    <Select value={formData.ethnicity} onValueChange={(value) => handleInputChange('ethnicity', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        {ethnicityOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Required Fields */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="patient@email.com"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Insurance <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.insurance} onValueChange={(value) => handleInputChange('insurance', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Insurance" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Primary Physician <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.primaryPhysician} onValueChange={(value) => handleInputChange('primaryPhysician', value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Physician" />
                      </SelectTrigger>
                      <SelectContent>
                        {physicianOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
