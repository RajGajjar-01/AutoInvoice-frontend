import { createFileRoute, redirect } from "@tanstack/react-router";

// The dashboard was moved to /_layout/dashboard.
// Keep this file so the router doesn't 404 on /_layout/ — just redirect.
export const Route = createFileRoute("/_layout/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  },
  component: () => null,
});
