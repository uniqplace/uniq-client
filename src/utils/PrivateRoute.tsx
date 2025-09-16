import type { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    const isAuth = useSelector((state:any)=>state.auth.isUserLoggedIn)
    const { id, loading } = useSelector((state: any) => state.user);
  
    if (loading ) {
      return (
        <div className="text-center py-8">
          <span className="pi pi-spin pi-spinner text-2xl" /> Loading...
        </div>
      );
    }
  
    if (!id && !isAuth) {
      return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }
  
    return children;
  };
  