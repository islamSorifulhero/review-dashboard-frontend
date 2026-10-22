"use client";

import { useQuery } from "@tanstack/react-query";
import { api, Submission } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

export function MySubmissions() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => api<{ items: Submission[] }>("/submissions/mine"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-16 animate-pulse rounded-md bg-muted" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Couldn&apos;t load your submissions.{" "}
            <button className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </p>
        ) : data!.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t submitted anything yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.projectName}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
