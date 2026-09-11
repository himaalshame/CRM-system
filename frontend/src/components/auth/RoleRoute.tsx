import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

type Role = "ADMIN" | "EMPLOYEE" | "CLIENT";

type RoleRouteProps = {
  allowedRoles: Role[];
};

export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}