import { Navigate, useLocation } from "react-router-dom";
import { PetHubLoader } from "../components/PetHubLoader";
import { useAuth } from "../context/AuthContext";
import { getAppHomePath } from "../utils/authSession";

export const ProtectedRoute = ({
  children,
  allowedRoles,
  allowIncompleteOnboarding = false,
  redirectIfCompletedTo,
}) => {
  const { isAuthReady, userProfile } = useAuth();
  const token = localStorage.getItem("userToken");
  const location = useLocation();
  const isAdmin = userProfile?.role === "admin";

  if (!isAuthReady) {
    return (
      <PetHubLoader
        fullScreen
        title="Checking Session"
        message="Checking your PetHub session and restoring your care space."
      />
    );
  }

  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (
    userProfile &&
    !isAdmin &&
    !allowIncompleteOnboarding &&
    !userProfile.onboardingCompleted &&
    location.pathname !== "/onboarding"
  ) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/onboarding?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (location.pathname === "/onboarding" && userProfile?.onboardingCompleted && redirectIfCompletedTo) {
    const fallbackPath = redirectIfCompletedTo ?? getAppHomePath();
    return <Navigate to={fallbackPath} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to={getAppHomePath()} replace />;
  }

  return <>{children}</>;
};
