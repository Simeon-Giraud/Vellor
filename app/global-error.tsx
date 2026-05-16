"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased selection:bg-zinc-800 selection:text-zinc-100">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Critical Error
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              A critical error occurred that prevented the application from loading. 
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <button
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-md bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reload application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
