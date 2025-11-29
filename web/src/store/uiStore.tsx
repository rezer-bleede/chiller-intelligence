import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface UiContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

const STORAGE_KEY = 'chiller-ui-sidebar-collapsed';

const UiContext = createContext<UiContextValue | undefined>(undefined);

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  };

  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSidebarCollapsedState(stored === 'true');
    }
  }, []);

  const value: UiContextValue = useMemo(
    () => ({ sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed }),
    [sidebarCollapsed],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within UiProvider');
  }
  return context;
};
