"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { api, User } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function Header({ user }: { user: User }) {
  const router = useRouter();
  const qc = useQueryClient();
  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => null);
    qc.clear();
    router.replace("/login");
  }
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="font-semibold">Project Review Dashboard</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {user.name} · {user.role === "MENTOR" ? "Mentor" : "Student"}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
