import { useEffect, useState } from "react";
import { NotificationsModule } from "../components/notifications/NotificationsModule";
import { listArticles } from "../services/articlesApi";
import { listNotifications } from "../services/notificationsApi";
import type { Article, EmailNotification } from "../types/entities";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { useAppContext } from "../context/AppContext";

async function loadAllArticles(): Promise<Article[]> {
  const limit = 100;
  const first = await listArticles({ page: 1, limit });
  const all = [...first.articles];
  for (let page = 2; page <= first.pagination.pages; page += 1) {
    const next = await listArticles({ page, limit });
    all.push(...next.articles);
  }
  return all;
}

export function NotificationsPage() {
  const { refreshReferenceData } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [articleData, notificationData] = await Promise.all([loadAllArticles(), listNotifications(200)]);
      setArticles(articleData);
      setNotifications(notificationData);
      await refreshReferenceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (loading) return <LoadingState label="Chargement des notifications..." />;
  if (error) return <ErrorState message={error} onRetry={() => void refresh()} />;

  return (
    <NotificationsModule
      articles={articles}
      notifications={notifications}
      onRefresh={async () => {
        await refresh();
      }}
    />
  );
}
