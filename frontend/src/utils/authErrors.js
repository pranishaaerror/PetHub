export const getAuthErrorMessage = (error) => {
  const apiMsg = error?.response?.data?.message;
  if (apiMsg && typeof apiMsg === "string") {
    return apiMsg;
  }

  const code = error?.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "Invalid email or password. Please check and try again.";
  }
  if (code === "auth/user-not-found") {
    return "No account found for this email.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/user-disabled") {
    return "This account has been disabled.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Sign-in was cancelled.";
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email using a different sign-in method.";
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
