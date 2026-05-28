import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ludexApi, type LoginPayload, type RegisterPayload } from "../../api/ludexApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "../../lib/tokenStore";
import type { ApiUser } from "../../types/api";

type AuthStatus = "checking" | "authenticated" | "guest";

type AuthContextValue = {
  user: ApiUser | null;
  status: AuthStatus;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAuthToken() ? "checking" : "guest"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!getAuthToken()) {
      setStatus("guest");
      return;
    }

    ludexApi
      .me()
      .then((currentUser) => {
        if (!isActive) {
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch((requestError: Error) => {
        if (!isActive) {
          return;
        }

        clearAuthToken();
        setUser(null);
        setError(requestError.message);
        setStatus("guest");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    const response = await ludexApi.login(payload);
    setAuthToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    const response = await ludexApi.register(payload);
    setAuthToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    setError(null);

    try {
      await ludexApi.logout();
    } finally {
      clearAuthToken();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      clearError: () => setError(null)
    }),
    [error, login, logout, register, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

