import { useEffect, useMemo, useState } from "react";
import { CategoryManager } from "../components/categories/CategoryManager";
import { NetworkManager } from "../components/categories/NetworkManager";
import { useAppContext } from "../context/AppContext";
import { listArticles } from "../services/articlesApi";
import type { Article } from "../types/entities";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";

async function loadAllArticles(): Promise<Article[]> {
  const limit = 100;
  const first = await listArticles({ page: 1, limit });
  const result = [...first.articles];
  for (let page = 2; page <= first.pagination.pages; page += 1) {
    const next = await listArticles({ page, limit });
    result.push(...next.articles);
  }
  return result;
}

export function CategoriesPage() {
  const { categories, networks, refreshReferenceData } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const articleData = await loadAllArticles();
      setArticles(articleData);
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

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const article of articles) {
      for (const category of article.categories) {
        counts[category.id] = (counts[category.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [articles]);

  if (loading) return <LoadingState label="Chargement des catégories et réseaux..." />;
  if (error) return <ErrorState message={error} onRetry={() => void refresh()} />;

  return (
    <section className="stack">
      <CategoryManager
        categories={categories}
        articleCountByCategory={countByCategory}
        onChanged={async () => {
          await refresh();
        }}
      />
      <NetworkManager
        networks={networks}
        onChanged={async () => {
          await refresh();
        }}
      />
    </section>
  );
}
