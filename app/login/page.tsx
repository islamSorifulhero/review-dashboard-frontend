"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, User } from "@/lib/api";
import { homeFor } from "@/lib/auth-context";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";

export default function LoginPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (v: LoginInput) => api<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: ({ user }) => {
      qc.setQueryData(["me"], user);
      router.replace(homeFor(user.role));
    },
  });

  return (
    <main className="mx-auto mt-24 max-w-md px-4">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back. Log in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
            </Field>
            {mutation.error instanceof ApiError && (
              <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-destructive">
                {mutation.error.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Logging in..." : "Log in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New student?{" "}
              <Link href="/signup" className="font-medium text-foreground underline">
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
