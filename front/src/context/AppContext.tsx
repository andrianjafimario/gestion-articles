import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Category, EmailNotification, Network } from "../types/entities";
import { listCategories } from "../services/categoriesApi";
import { listNetworks } from "../services/networksApi";
import { listNotifications } from "../services/notificationsApi";

interface AppContextValue {
  categories: Category[];
  networks: Network[];
  recentNotifications: EmailNotification[];
  loading: boolean;
  error: string | null;
  refreshReferenceData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryData, networkData, notificationData] = await Promise.all([
        listCategories(),
        listNetworks(),
        listNotifications(10),
      ]);
      setCategories(categoryData);
      setNetworks(networkData);
      setRecentNotifications(notificationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshReferenceData();
  }, [refreshReferenceData]);

  const value = useMemo<AppContextValue>(
    () => ({
      categories,
      networks,
      recentNotifications,
      loading,
      error,
      refreshReferenceData,
    }),
    [categories, networks, recentNotifications, loading, error, refreshReferenceData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
