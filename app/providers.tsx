"use client";

import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import dynamic from "next/dynamic";
import { useState } from "react";
import superjson from "superjson";

const App = dynamic(() => import("@/App"), { ssr: false });

function redirectToLoginIfUnauthorized(error: unknown) {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.message === UNAUTHED_ERR_MSG && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default function Providers() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers() {
            try {
              const raw = sessionStorage.getItem("app-session-cookie");
              if (raw) {
                const prefix = `${COOKIE_NAME}=`;
                const pair = raw.split(";").find((entry) => entry.trim().startsWith(prefix));
                const token = pair?.trim().slice(prefix.length);
                if (token) return { Authorization: `Bearer ${token}` };
              }
            } catch {}
            return {};
          },
          fetch(input, init) {
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
      ],
    }),
  );

  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      redirectToLoginIfUnauthorized(event.query.state.error);
    }
  });

  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      redirectToLoginIfUnauthorized(event.mutation.state.error);
    }
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}