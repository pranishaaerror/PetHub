import { browserLocalPersistence, setPersistence } from "firebase/auth";
import { getInfo } from "../apis/auth/apis";

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL ?? "").trim().toLowerCase();

export const isAdminEmail = (email = "") =>
  Boolean(email) && email.trim().toLowerCase() === ADMIN_EMAIL;

export const resolveRedirectPath = (candidate, fallbackPath = "/dashboard") => {
  if (!candidate || typeof candidate !== "string") {
    return fallbackPath;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallbackPath;
  }

  return candidate;
};

export const getStoredUserInfo = () => {
  const rawUser = localStorage.getItem("userInfo");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("Failed to parse stored user info:", error);
    localStorage.removeItem("userInfo");
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userInfo");
};

export const enablePersistentAuth = async (auth) => {
  await setPersistence(auth, browserLocalPersistence);
};

export const storeUserToken = async (user, forceRefresh = false) => {
  const token = await user.getIdToken(forceRefresh);
  localStorage.setItem("userToken", token);
  return token;
};

export const syncUserProfile = async (token) => {
  const { data } = await getInfo({ token });
  const normalizedProfile = {
    ...data,
    role: data?.role ?? (isAdminEmail(data?.email) ? "admin" : "user"),
  };

  localStorage.setItem("userInfo", JSON.stringify(normalizedProfile));
  return normalizedProfile;
};

export const establishUserSession = async (auth, user, forceRefresh = false) => {
  await enablePersistentAuth(auth);
  const token = await storeUserToken(user, forceRefresh);
  const profile = await syncUserProfile(token);

  return { token, profile };
};

export const getAppHomePath = (profile = getStoredUserInfo()) =>
  profile?.role === "admin" ? "/admin" : "/dashboard";
