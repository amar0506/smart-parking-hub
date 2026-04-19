import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  adminOnly = false,
  userOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin-only routes: block non-admins
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  // User-only routes: redirect admins to admin dashboard
  if (userOnly && isAdmin) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
