import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useSelector((state: any) => state.auth.isUserLoggedIn);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
