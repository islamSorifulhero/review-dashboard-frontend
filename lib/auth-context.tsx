"use client";

import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError, Role, User } from "@/lib/api";

type AuthState = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api<{ user: User }>("/auth/me")).user;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null; // not logged in is a normal state
        throw e;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return <AuthContext.Provider value={{ user: data ?? null, loading: isLoading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export const homeFor = (role: Role) => (role === "MENTOR" ? "/mentor" : "/student");

// UI-level guard (UX only). Real protection is on the server: every route checks the role.
export function useRequireRole(role: Role) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user.role));
  }, [user, loading, role, router]);
  return { user: user?.role === role ? user : null, loading };
}
