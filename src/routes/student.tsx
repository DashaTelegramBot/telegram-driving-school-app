import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import StudentDashboard from "@/pages/StudentDashboard";

export const StudentRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/student",
  component: StudentDashboard,
});
