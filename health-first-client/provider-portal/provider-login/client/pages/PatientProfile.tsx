import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EHRLayout from '@/components/EHRLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Upload, X, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  timezone: string;
  language: string;
  race: string;
  ethnicity: string;
  ssn: string;
  profilePicture?: string;
}

export default function PatientProfile() {
  const { id } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: 'Heena',
    middleName: 'John',
    lastName: 'Heena',
    dateOfBirth: '22-07-1940',
    gender: 'Female',
    maritalStatus: 'Unmarried',
    timezone: 'Eastern Standard Time',
    language: 'English (US)',
    race: 'American',
    ethnicity: 'Central American',
    ssn: '6084064',
    profilePicture: undefined,
  });

  const [editData, setEditData] = useState<PatientData>(patientData);

  const handleSave = () => {
    setPatientData(editData);
    setIsEditModalOpen(false);
  };

  const handleCancel = () => {
    setEditData(patientData);
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditData({ ...editData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <EHRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </Link>
            <h1 className="text-xl font-medium text-foreground">Patient Details</h1>
          </div>
          <Button onClick={() => setIsEditModalOpen(true)} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2">
            Edit Profile
          </Button>
        </div>

        {/* Patient Profile Card */}
        <Card className="max-w-4xl bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 pb-4 bg-gray-50">
            <CardTitle className="text-lg font-medium text-gray-900">Demographics</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <div className="grid grid-cols-2 gap-x-16 gap-y-6">
              {/* First Name */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">First Name</Label>
                <div className="text-sm text-gray-600">{patientData.firstName}</div>
              </div>
              {/* Marital Status */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Marital Status</Label>
                <div className="text-sm text-gray-600">{patientData.maritalStatus}</div>
              </div>

              {/* Middle Name */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Middle Name</Label>
                <div className="text-sm text-gray-600">{patientData.middleName}</div>
              </div>
              {/* Timezone */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Timezone</Label>
                <div className="text-sm text-gray-600">{patientData.timezone}</div>
              </div>

              {/* Last Name */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Last Name</Label>
                <div className="text-sm text-gray-600">{patientData.lastName}</div>
              </div>
              {/* Language */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Language</Label>
                <div className="text-sm text-gray-600">{patientData.language}</div>
              </div>

              {/* Date of Birth */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Date of Birth</Label>
                <div className="text-sm text-gray-600">{patientData.dateOfBirth}</div>
              </div>
              {/* Race */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Race</Label>
                <div className="text-sm text-gray-600">{patientData.race}</div>
              </div>

              {/* Gender */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Gender</Label>
                <div className="text-sm text-gray-600">{patientData.gender}</div>
              </div>
              {/* Ethnicity */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Ethnicity</Label>
                <div className="text-sm text-gray-600">{patientData.ethnicity}</div>
              </div>

              {/* SSN */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">SSN</Label>
                <div className="text-sm text-gray-600">{patientData.ssn}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Modal - Matching Figma Design */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl bg-white border-0 p-0 rounded-lg overflow-hidden">
            {/* Modal Header */}
            <DialogHeader className="border-b border-gray-200 px-6 py-4 bg-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-medium text-gray-900">Edit Profile</DialogTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="px-6 py-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Profile Picture Section */}
                <div className="col-span-3">
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Profile Picture</Label>
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      {editData.profilePicture ? (
                        <img 
                          src={editData.profilePicture} 
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
                          <span>Change Photo</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="col-span-9">
                  <div className="grid grid-cols-3 gap-6">
                    {/* First Row */}
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-900 mb-2 block">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="middleName" className="text-sm font-medium text-gray-900 mb-2 block">
                        Middle Name
                      </Label>
                      <Input
                        id="middleName"
                        value={editData.middleName}
                        onChange={(e) => setEditData({ ...editData, middleName: e.target.value })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-900 mb-2 block">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Second Row */}
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-900 mb-2 block">
                        Date Of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        value={editData.dateOfBirth}
                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="22-07-1940"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-900 mb-2 block">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select value={editData.gender} onValueChange={(value) => setEditData({ ...editData, gender: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-900 mb-2 block">
                        Marital Status
                      </Label>
                      <Select value={editData.maritalStatus} onValueChange={(value) => setEditData({ ...editData, maritalStatus: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unmarried">Unmarried</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Third Row */}
                    <div>
                      <Label htmlFor="timezone" className="text-sm font-medium text-gray-900 mb-2 block">
                        Timezone
                      </Label>
                      <Select value={editData.timezone} onValueChange={(value) => setEditData({ ...editData, timezone: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Eastern Standard Time">Eastern Standard Time</SelectItem>
                          <SelectItem value="Central Standard Time">Central Standard Time</SelectItem>
                          <SelectItem value="Mountain Standard Time">Mountain Standard Time</SelectItem>
                          <SelectItem value="Pacific Standard Time">Pacific Standard Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language" className="text-sm font-medium text-gray-900 mb-2 block">
                        Language
                      </Label>
                      <Select value={editData.language} onValueChange={(value) => setEditData({ ...editData, language: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English (US)">English (US)</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ssn" className="text-sm font-medium text-gray-900 mb-2 block">
                        SSN
                      </Label>
                      <Input
                        id="ssn"
                        value={editData.ssn}
                        onChange={(e) => setEditData({ ...editData, ssn: e.target.value })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Fourth Row */}
                    <div>
                      <Label htmlFor="race" className="text-sm font-medium text-gray-900 mb-2 block">
                        Race
                      </Label>
                      <Select value={editData.race} onValueChange={(value) => setEditData({ ...editData, race: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="American">American</SelectItem>
                          <SelectItem value="Asian">Asian</SelectItem>
                          <SelectItem value="African American">African American</SelectItem>
                          <SelectItem value="Hispanic">Hispanic</SelectItem>
                          <SelectItem value="White">White</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ethnicity" className="text-sm font-medium text-gray-900 mb-2 block">
                        Ethnicity
                      </Label>
                      <Select value={editData.ethnicity} onValueChange={(value) => setEditData({ ...editData, ethnicity: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Central American">Central American</SelectItem>
                          <SelectItem value="South American">South American</SelectItem>
                          <SelectItem value="North American">North American</SelectItem>
                          <SelectItem value="European">European</SelectItem>
                          <SelectItem value="Asian">Asian</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EHRLayout>
  );
}
