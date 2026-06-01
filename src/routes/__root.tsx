import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { StarField } from "@/components/StarField";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-7xl text-syrup-glow" style={{ color: "var(--syrup)" }}>404</h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Sector uncharted</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl">Pressure breach</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="clip-hex mt-6 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ background: "var(--grad-syrup)", color: "var(--pitted)" }}
        >Re-seal</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Planetary Harvester // Command Surface" },
      { name: "description", content: "Cherry-glaze planetary resource extraction command center." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StarField />
      <Outlet />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(18% 0.06 18)",
            color: "oklch(85% 0.1 60)",
            border: "1px solid oklch(40% 0.12 22 / 0.6)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          },
        }}
      />
    </QueryClientProvider>
  );
}
