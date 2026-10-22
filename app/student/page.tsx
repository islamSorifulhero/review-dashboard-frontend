"use client";

import { useRequireRole } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { SubmissionForm } from "@/components/submission-form";
import { MySubmissions } from "@/components/my-submissions";

export default function StudentPage() {
  const { user, loading } = useRequireRole("STUDENT");
  if (loading || !user) return <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>;
  return (
    <>
      <Header user={user} />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
        <SubmissionForm />
        <MySubmissions />
      </main>
    </>
  );
}
