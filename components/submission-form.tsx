"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { submissionSchema, SubmissionInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";

export function SubmissionForm() {
  const qc = useQueryClient();
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { projectName: "", repoUrl: "", liveUrl: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: SubmissionInput) => api("/submissions", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      reset();
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
    },
    onError: (err) => {
      setSuccess(false);
      // surface server-side field errors (e.g. duplicate repo) on the matching input
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          setError(field as keyof SubmissionInput, { message: messages[0] });
        }
      }
    },
  });

  const serverError = mutation.error instanceof ApiError && !mutation.error.fieldErrors ? mutation.error.message : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a project</CardTitle>
        <CardDescription>Share your project so a mentor can review it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            setSuccess(false);
            mutation.mutate(v);
          })}
        >
          <Field label="Project name" htmlFor="projectName" error={errors.projectName?.message}>
            <Input id="projectName" aria-invalid={!!errors.projectName} {...register("projectName")} />
          </Field>
          <Field label="GitHub repository URL" htmlFor="repoUrl" error={errors.repoUrl?.message}>
            <Input id="repoUrl" placeholder="https://github.com/owner/repo" aria-invalid={!!errors.repoUrl} {...register("repoUrl")} />
          </Field>
          <Field label="Live link" htmlFor="liveUrl" optional error={errors.liveUrl?.message}>
            <Input id="liveUrl" placeholder="https://my-project.vercel.app" aria-invalid={!!errors.liveUrl} {...register("liveUrl")} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" aria-invalid={!!errors.description} {...register("description")} />
          </Field>
          {serverError && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-destructive">
              {serverError}
            </p>
          )}
          {success && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">Project submitted! It is now pending review.</p>}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
