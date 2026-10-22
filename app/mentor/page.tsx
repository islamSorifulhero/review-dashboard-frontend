"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { api, ApiError, ListResponse, Stats } from "@/lib/api";
import { useRequireRole } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
] as const;
const LIMIT = 10;

export default function MentorPage() {
  const { user, loading } = useRequireRole("MENTOR");
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const stats = useQuery({ queryKey: ["stats"], queryFn: () => api<Stats>("/submissions/stats"), enabled: !!user });

  // filter + page are part of the query key -> each combination is cached separately
  const list = useQuery({
    queryKey: ["submissions", status, page],
    queryFn: () => api<ListResponse>(`/submissions?page=${page}&limit=${LIMIT}${status ? `&status=${status}` : ""}`),
    placeholderData: keepPreviousData, // keep old rows on screen while the next page loads
    enabled: !!user,
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      api(`/submissions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    // cache invalidation: stats and lists are now stale, so refetch them (even on 409 so the UI shows the truth)
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (loading || !user) return <p className="p-8 text-center text-sm text-muted-foreground">Loading...</p>;

  const meta = list.data?.meta;
  const cards = [
    { label: "Total", value: stats.data?.total },
    { label: "Pending", value: stats.data?.pending },
    { label: "Approved", value: stats.data?.approved },
    { label: "Rejected", value: stats.data?.rejected },
  ];

  return (
    <>
      <Header user={user} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label === "Total" ? "Total submissions" : `Total ${c.label}`}</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.isError ? <span className="text-sm text-destructive">—</span> : c.value === undefined ? <div className="h-8 w-12 animate-pulse rounded bg-muted" /> : <p className="text-3xl font-bold">{c.value}</p>}
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Submissions</CardTitle>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <Button
                  key={f.label}
                  size="sm"
                  variant={status === f.value ? "default" : "outline"}
                  onClick={() => {
                    setStatus(f.value);
                    setPage(1);
                  }}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {review.error instanceof ApiError && (
              <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-destructive">
                {review.error.message}
              </p>
            )}
            {list.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : list.isError ? (
              <div className="space-y-3 py-6 text-center">
                <p className="text-sm text-destructive">{list.error.message}</p>
                <Button variant="outline" size="sm" onClick={() => list.refetch()}>
                  Retry
                </Button>
              </div>
            ) : list.data!.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No submissions found.</p>
            ) : (
              <div className={list.isPlaceholderData ? "opacity-60 transition-opacity" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.data!.items.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.projectName}</div>
                          <div className="max-w-xs truncate text-xs text-muted-foreground" title={s.description}>
                            {s.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{s.student?.name}</div>
                          <div className="text-xs text-muted-foreground">{s.student?.email}</div>
                        </TableCell>
                        <TableCell className="space-y-1 text-xs">
                          <a href={s.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline">
                            Repo <ExternalLink className="h-3 w-3" />
                          </a>
                          {s.liveUrl && (
                            <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline">
                              Live <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          {s.status === "PENDING" ? (
                            <>
                              <Button size="sm" disabled={review.isPending} onClick={() => review.mutate({ id: s.id, status: "APPROVED" })}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" disabled={review.isPending} onClick={() => review.mutate({ id: s.id, status: "REJECTED" })}>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Reviewed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {meta && meta.total > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {meta.page} of {meta.totalPages} · {meta.total} total
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
