import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import LoginPage from "@/pages/LoginPage";

export const LoginRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: LoginPage,
});
