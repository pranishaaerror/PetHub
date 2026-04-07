import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getAuth, onIdTokenChanged, signInWithCustomToken } from "firebase/auth";
import { app } from "../Firebase";
import { verifySignupOtp } from "../apis/auth/apis";
import { queryClient } from "../lib/queryClient";
import {
  clearStoredAuth,
  enablePersistentAuth,
  establishUserSession,
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
  verifyOtpAndLogin: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser);
  const [userProfile, setUserProfile] = useState(() =>
    auth.currentUser ? getStoredUserInfo() : null,
  );
  const [isAuthReady, setIsAuthReady] = useState(false);
  const previousUidRef = useRef(undefined);

  const verifyOtpAndLogin = async (email, otp) => {
    const { data } = await verifySignupOtp({ email, otp });
    const customToken = data?.customToken;
    if (!customToken) {
      throw new Error("Verification succeeded but no session token was returned.");
    }
    const credential = await signInWithCustomToken(auth, customToken);
    await establishUserSession(auth, credential.user, true);
  };

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

      const nextUid = user?.uid ?? null;
      const uidChanged = previousUidRef.current !== nextUid;
      const hadObservedUid = previousUidRef.current !== undefined;

      if (uidChanged && hadObservedUid) {
        queryClient.clear();
      }
      previousUidRef.current = nextUid;

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
    <AuthContext.Provider
      value={{ auth, currentUser, isAuthReady, userProfile, refreshUserProfile, verifyOtpAndLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
