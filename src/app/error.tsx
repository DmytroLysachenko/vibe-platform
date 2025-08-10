"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Home, Clipboard } from "lucide-react";

export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("App error boundary captured:", error);
  }, [error]);

  const details = useMemo(() => {
    return [
      `message: ${error?.message ?? "(no message)"}`,
      error?.digest ? `digest: ${error.digest}` : null,
      process.env.NODE_ENV !== "production" && error?.stack
        ? `stack:\n${error.stack}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [error]);

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-[70vh] w-full grid place-items-center bg-background px-6">
      <div className="w-full max-w-2xl rounded-2xl border shadow-sm p-6 md:p-8 bg-card">
        <div className="flex items-center gap-3">
          <div className="size-10 grid place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-300/60">
            <AlertTriangle
              className="h-5 w-5"
              aria-hidden
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              We hit an unexpected error. You can try again or head home.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="rounded-xl bg-muted/40 border p-4">
            <p className="font-mono whitespace-pre-wrap break-words leading-relaxed text-xs">
              {details}
            </p>
          </div>
          {process.env.NODE_ENV === "production" && (
            <p className="text-xs text-muted-foreground">
              Error reference:{" "}
              <span className="font-mono">{error?.digest ?? "n/a"}</span>
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm hover:bg-muted/50"
          >
            <Home className="h-4 w-4" /> Go home
          </Link>

          <button
            onClick={copyDetails}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm hover:bg-muted/50"
          >
            <Clipboard className="h-4 w-4" />{" "}
            {copied ? "Copied" : "Copy details"}
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Tip: error details are shown inline in development; in production,
          only the digest is displayed.
        </p>
      </div>
    </main>
  );
}
