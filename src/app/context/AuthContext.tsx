import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  correo: string;
  nombre: string;
  matricula: string;
  rol: 'admin' | 'alumno';
  estado: 'pendiente' | 'activo' | 'rechazado';
}

interface AuthContextType {
  user: User | null;
  login: (correo: string, password: string) => Promise<boolean>;
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

  const login = async (correo: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error:', error);
        return false;
      }

      const data = await response.json();
      const { token, usuario } = data;

      // Guardar token y usuario
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUser(usuario);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (correo: string, password: string, nombre: string, matricula: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password, nombre, matricula }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Register error:', error);
        return false;
      }

      const data = await response.json();

      //? Si el registro es exitoso pero el estado es pendiente, no hacer login automático
      if (data.usuario?.estado === 'pendiente') {
        return true;
      }

      //? Si el usuario es aprobado automáticamente
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
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
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