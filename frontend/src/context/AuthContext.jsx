import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { app } from "../Firebase";
import {
  clearStoredAuth,
  enablePersistentAuth,
  getStoredUserInfo,
  storeUserToken,
  syncUserProfile,
} from "../utils/authSession";

const auth = getAuth(app);

const AuthContext = createContext({
  auth,
  currentUser: null,
  isAuthReady: false,
  userProfile: null,
  refreshUserProfile: async () => null,
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser);
  const [userProfile, setUserProfile] = useState(() => getStoredUserInfo());
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refreshUserProfile = async (forceRefresh = false) => {
    if (!auth.currentUser) {
      clearStoredAuth();
      setUserProfile(null);
      return null;
    }

    const token = await storeUserToken(auth.currentUser, forceRefresh);
    const profile = await syncUserProfile(token);
    setUserProfile(profile);
    return profile;
  };

  useEffect(() => {
    let isMounted = true;

    enablePersistentAuth(auth).catch((error) => {
      console.error("Failed to enable auth persistence:", error);
    });

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      setCurrentUser(user ?? null);

      if (!user) {
        clearStoredAuth();
        setUserProfile(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const token = await storeUserToken(user);
        const profile = await syncUserProfile(token);
        setUserProfile(profile);

        if (isMounted) {
          setIsAuthReady(true);
        }
      } catch (error) {
        console.error("Failed to refresh auth session:", error);

        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ auth, currentUser, isAuthReady, userProfile, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
