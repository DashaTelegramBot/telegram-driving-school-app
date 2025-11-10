import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import InstructorDashboard from "@/pages/InstructorDashboard";

export const InstructorRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/instructor",
  component: InstructorDashboard,
});
