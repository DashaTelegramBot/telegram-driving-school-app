import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router"; // ИЗМЕНЕНО
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'student':
          navigate({ to: '/student', replace: true }); // ИЗМЕНЕНО для TanStack Router
          break;
        case 'instructor':
          navigate({ to: '/instructor', replace: true }); // ИЗМЕНЕНО
          break;
        case 'admin':
          navigate({ to: '/admin', replace: true }); // ИЗМЕНЕНО
          break;
        default:
          navigate({ to: '/login', replace: true }); // ИЗМЕНЕНО
      }
    } else {
      navigate({ to: '/login', replace: true }); // ИЗМЕНЕНО
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1A1B]">
      <div className="text-white">Перенаправление...</div>
    </div>
  );
};

export default Index;