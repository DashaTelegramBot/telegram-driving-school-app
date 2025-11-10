// src/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router"; // Добавлен Outlet
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export const RootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Outlet /> {/* Теперь Outlet корректен */}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  ),
});


