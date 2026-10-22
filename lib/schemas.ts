import { z } from "zod";

// Client-side validation gives instant feedback. The server validates again (never trust the client).
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/\d/, "Password must contain a number"),
});

export const submissionSchema = z.object({
  projectName: z.string().trim().min(3, "Project name must be at least 3 characters").max(80),
  repoUrl: z
    .string()
    .trim()
    .regex(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/i, "Must be a GitHub repo URL like https://github.com/owner/repo"),
  liveUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Must be a valid http(s) URL"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(1000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
