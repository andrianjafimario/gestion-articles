import { useEffect, useMemo, useState } from "react";
import { listArticles } from "../services/articlesApi";
import { useAppContext } from "../context/AppContext";
import type { Article } from "../types/entities";
import { StatCard } from "../components/common/StatCard";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { formatDateTime, relativeDate } from "../utils/date";
import { StatusBadge } from "../components/common/StatusBadge";

async function loadAllArticles(): Promise<Article[]> {
  const limit = 100;
  const first = await listArticles({ page: 1, limit });
  const results = [...first.articles];
  for (let page = 2; page <= first.pagination.pages; page += 1) {
    const next = await listArticles({ page, limit });
    results.push(...next.articles);
  }
  return results;
}

export function DashboardPage() {
  const { networks, categories, recentNotifications } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAllArticles();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const stats = useMemo(() => {
    const byStatus = {
      draft: 0,
      published: 0,
      archived: 0,
    };
    const byNetwork = new Map<string, number>();
    const byCategory = new Map<string, number>();

    for (const article of articles) {
      byStatus[article.status] += 1;
      byNetwork.set(article.network.name, (byNetwork.get(article.network.name) ?? 0) + 1);
      for (const category of article.categories) {
        byCategory.set(category.name, (byCategory.get(category.name) ?? 0) + 1);
      }
    }

    return {
      total: articles.length,
      byStatus,
      byNetwork: Array.from(byNetwork.entries()).sort((a, b) => b[1] - a[1]),
      byCategory: Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]),
      latestPublished: articles
        .filter((article) => article.publishedAt)
        .sort(
          (a, b) =>
            new Date(b.publishedAt as string).getTime() - new Date(a.publishedAt as string).getTime(),
        )
        .slice(0, 5),
    };
  }, [articles]);

  if (loading) return <LoadingState label="Chargement du dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => void fetchData()} />;

  const categoryMax = stats.byCategory[0]?.[1] ?? 1;

  return (
    <section className="stack">
      <h2>Dashboard administrateur</h2>
      <p className="muted-text">
        {networks.length} réseaux actifs, {categories.length} catégories, {recentNotifications.length} dernières
        notifications.
      </p>

      <div className="stats-grid">
        <StatCard title="Articles total" value={stats.total} />
        <StatCard title="Brouillons" value={stats.byStatus.draft} />
        <StatCard title="Publiés" value={stats.byStatus.published} />
        <StatCard title="Archivés" value={stats.byStatus.archived} />
      </div>

      <div className="grid-two">
        <article className="panel">
          <h3>Répartition par catégorie</h3>
          <div className="bar-chart" aria-label="Graphique de répartition catégories">
            {stats.byCategory.map(([name, count]) => (
              <div key={name} className="bar-row">
                <span>{name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(count / categoryMax) * 100}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Articles par réseau</h3>
          <ul className="clean-list">
            {stats.byNetwork.map(([network, count]) => (
              <li key={network}>
                <span>{network}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid-two">
        <article className="panel">
          <h3>5 derniers articles publiés</h3>
          <ul className="clean-list">
            {stats.latestPublished.map((article) => (
              <li key={article.id}>
                <div>
                  <strong>{article.title}</strong>
                  <span>{article.network.name}</span>
                </div>
                <div>
                  <StatusBadge status={article.status} />
                  <small>{formatDateTime(article.publishedAt)}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Dernières notifications envoyées</h3>
          <ul className="clean-list">
            {recentNotifications.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.article?.title || item.articleId}</strong>
                  <span>{item.subject}</span>
                </div>
                <div>
                  <StatusBadge status={item.status} />
                  <small>{relativeDate(item.sentAt)}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
