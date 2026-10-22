const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include", // send the httpOnly auth cookie
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message ?? "Something went wrong", data?.fieldErrors);
  return data as T;
}

export type Role = "STUDENT" | "MENTOR";
export type Status = "PENDING" | "APPROVED" | "REJECTED";
export type User = { id: string; name: string; email: string; role: Role };
export type Submission = {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: Status;
  createdAt: string;
  student?: { id: string; name: string; email: string };
};
export type Stats = { total: number; pending: number; approved: number; rejected: number };
export type ListResponse = {
  items: Submission[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
