"use client";

import { Button } from "@/components/ui/button";

// Error boundary for the whole app: an unexpected render error shows this instead of a white screen
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto mt-24 max-w-md space-y-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
