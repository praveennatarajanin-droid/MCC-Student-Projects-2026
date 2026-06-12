"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

export interface User {
  id: string;
  email: string;
  role: string;
  studentId?: string;
  rollNumber?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  slug?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rollNumber?: string | null;
    department?: string | null;
    batchYear?: string | null;
    role?: string;
    verificationCode?: string | null;
  }) => Promise<void>;
  logout: () => void;
  updateUserLocal: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("mcc_token");
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("mcc_token");
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await api.get<User>("/auth/me", storedToken);
          setUser(userData);
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [logout]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      localStorage.setItem("mcc_token", res.token);
      setToken(res.token);
      setUser(res.user);
      
      if (res.user.role === "Admin") {
        router.push("/dashboard/admin");
      } else if (
        res.user.role === "PlacementCoordinator" ||
        res.user.role === "ResearchCoordinator" ||
        res.user.role === "InnovationCoordinator" ||
        res.user.role === "StudentAffairsCoordinator"
      ) {
        router.push("/dashboard/coordinator");
      } else if (res.user.role === "Faculty") {
        router.push("/dashboard/faculty");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err) {
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post<{ token: string; user: User }>("/auth/register", data);
      localStorage.setItem("mcc_token", res.token);
      setToken(res.token);
      setUser(res.user);
      
      if (res.user.role === "Admin") {
        router.push("/dashboard/admin");
      } else if (
        res.user.role === "PlacementCoordinator" ||
        res.user.role === "ResearchCoordinator" ||
        res.user.role === "InnovationCoordinator" ||
        res.user.role === "StudentAffairsCoordinator"
      ) {
        router.push("/dashboard/coordinator");
      } else if (res.user.role === "Faculty") {
        router.push("/dashboard/faculty");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err) {
      throw err;
    }
  };

  const updateUserLocal = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
