import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ChefRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user || (role !== "chef" && role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ChefRoute;
