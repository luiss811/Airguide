import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  correo: string;
  nombre: string;
  matricula: string;
  rol: 'admin' | 'alumno';
  estado: 'pendiente' | 'activo' | 'rechazado';
}

export type LoginResult =
  | { success: true; requiresTwoFactor: false }
  | { success: true; requiresTwoFactor: true; correo: string }
  | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  login: (correo: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (correo: string, codigo: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (correo: string) => Promise<void>;
  register: (correo: string, password: string, nombre: string, matricula: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (correo: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Credenciales incorrectas' };
      }

      if (data.requiresTwoFactor) {
        return { success: true, requiresTwoFactor: true, correo: data.correo };
      }

      return { success: false, error: 'Respuesta inesperada del servidor' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' };
    }
  };

  const verifyTwoFactor = async (
    correo: string,
    codigo: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Código incorrecto' };
      }

      const { token, usuario } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUser(usuario);

      return { success: true };
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' };
    }
  };

  const resendOtp = async (correo: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  const register = async (
    correo: string,
    password: string,
    nombre: string,
    matricula: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password, nombre, matricula }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Register error:', error);
        return false;
      }

      const data = await response.json();

      if (data.usuario?.estado === 'pendiente') {
        return true;
      }

      if (data.token && data.usuario) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setUser(data.usuario);
      }

      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const isAdmin = () => user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, verifyTwoFactor, resendOtp, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe de usarse dentro de AuthProvider');
  }
  return context;
}
