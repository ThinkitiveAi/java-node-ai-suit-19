import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, FileText, Loader2, UserPlus } from 'lucide-react';

const roles = [
  'Doctor',
  'Nurse',
  'Administrator',
  'Technician',
  'Receptionist'
];

const specializations = [
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic Surgeon',
  'General Practitioner',
  'Psychiatrist',
  'Radiologist',
  'Anesthesiologist',
  'Emergency Medicine'
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    specialization: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, role } = formData;

    if (!name.trim()) {
      return 'Name is required';
    }

    if (!email.trim()) {
      return 'Email is required';
    }

    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address';
    }

    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    if (!role) {
      return 'Role is required';
    }

    if (role === 'Doctor' && !formData.specialization) {
      return 'Specialization is required for doctors';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        specialization: formData.specialization || undefined
      });

      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join MedFlow</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Register Form */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Role Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Role
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization Field - Only for Doctors */}
              {formData.role === 'Doctor' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Specialization
                  </Label>
                  <Select 
                    value={formData.specialization} 
                    onValueChange={(value) => handleInputChange('specialization', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 MedFlow EHR System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
