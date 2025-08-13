import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('ehrUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('ehrUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    const mockUsers = [
      {
        id: '1',
        email: 'doctor@medflow.com',
        password: 'password123',
        name: 'Dr. Sarah Johnson',
        role: 'Doctor',
        specialization: 'Cardiologist'
      },
      {
        id: '2',
        email: 'admin@medflow.com',
        password: 'admin123',
        name: 'John Admin',
        role: 'Administrator'
      },
      {
        id: '3',
        email: 'nurse@medflow.com',
        password: 'nurse123',
        name: 'Emily Nurse',
        role: 'Nurse'
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        specialization: foundUser.specialization
      };
      
      setUser(userData);
      localStorage.setItem('ehrUser', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } else {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration - in real app, this would be an API call
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      specialization: data.specialization
    };
    
    setUser(newUser);
    localStorage.setItem('ehrUser', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ehrUser');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
