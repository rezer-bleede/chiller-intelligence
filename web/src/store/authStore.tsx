import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, getMe, login as loginApi, register as registerApi } from '../api/auth';

export interface UserInfo {
  id: number;
  email: string;
  name: string;
}

export interface OrganizationInfo {
  id: number;
  name: string;
  type: string;
}

interface AuthContextValue {
  token?: string;
  user?: UserInfo;
  organization?: OrganizationInfo;
  initializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    organization_name: string;
    organization_type: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
  }) => Promise<void>;
  logout: () => void;
  initializeFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'chiller-intelligence-token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const getStoredToken = () => localStorage.getItem(STORAGE_KEY) ?? undefined;
export const clearStoredToken = () => localStorage.removeItem(STORAGE_KEY);

const storeToken = (token: string) => localStorage.setItem(STORAGE_KEY, token);

const mapAuthResponse = (data: AuthResponse) => ({
  token: data.access_token,
  user: data.user,
  organization: data.organization,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<UserInfo | undefined>();
  const [organization, setOrganization] = useState<OrganizationInfo | undefined>();
  const [initializing, setInitializing] = useState(true);

  const logout = () => {
    clearStoredToken();
    setToken(undefined);
    setUser(undefined);
    setOrganization(undefined);
  };

  const handleAuthResponse = (data: AuthResponse) => {
    const mapped = mapAuthResponse(data);
    storeToken(mapped.token);
    setToken(mapped.token);
    setUser(mapped.user);
    setOrganization(mapped.organization);
  };

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    handleAuthResponse(data);
  };

  const register = async (payload: {
    organization_name: string;
    organization_type: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
  }) => {
    const data = await registerApi(payload);
    handleAuthResponse(data);
  };

  const initializeFromStorage = async () => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      setInitializing(false);
      return;
    }
    try {
      const data = await getMe();
      handleAuthResponse({ ...data, access_token: existingToken });
    } catch (error) {
      clearStoredToken();
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    initializeFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      token,
      user,
      organization,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      initializeFromStorage,
    }),
    [token, user, organization, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };
