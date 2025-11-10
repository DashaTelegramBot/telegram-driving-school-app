import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import RoleSelectionPage from "@/pages/RoleSelectionPage";

export const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: RoleSelectionPage,
});
