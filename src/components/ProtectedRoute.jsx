import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({
  children,
}) {
  const { token } = useAuth();
  // No token
  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );
    const currentTime =
      Date.now() / 1000;
    // Token expired
    if (
      payload.exp &&
      payload.exp < currentTime
    ) {
      localStorage.removeItem("token");
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }
  } catch (error) {
    localStorage.removeItem("token");
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }
  return children;
}