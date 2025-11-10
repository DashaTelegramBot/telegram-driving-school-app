import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import AdminDashboard from "@/pages/AdminDashboard";

export const AdminRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin",
  component: AdminDashboard,
});
