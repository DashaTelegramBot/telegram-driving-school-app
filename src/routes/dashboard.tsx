import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import Index from "@/pages/Index";

export const DashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  component: Index,
});
