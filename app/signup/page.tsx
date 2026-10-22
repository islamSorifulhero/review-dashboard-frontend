"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, User } from "@/lib/api";
import { homeFor } from "@/lib/auth-context";
import { signupSchema, SignupInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";

export default function SignupPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: (v: SignupInput) => api<{ user: User }>("/auth/signup", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: ({ user }) => {
      qc.setQueryData(["me"], user);
      router.replace(homeFor(user.role));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, msgs] of Object.entries(err.fieldErrors)) setError(field as keyof SignupInput, { message: msgs[0] });
      }
    },
  });
  const serverError = mutation.error instanceof ApiError && !mutation.error.fieldErrors ? mutation.error.message : null;

  return (
    <main className="mx-auto mt-16 max-w-md px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create student account</CardTitle>
          <CardDescription>Sign up to submit your projects for review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
            <Field label="Full name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            </Field>
            {serverError && (
              <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-destructive">
                {serverError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
