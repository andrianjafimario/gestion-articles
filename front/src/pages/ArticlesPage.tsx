import { useEffect, useMemo, useState } from "react";
import { ArticleForm } from "../components/articles/ArticleForm";
import { ArticlesTable, type SortField } from "../components/articles/ArticlesTable";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  deleteArticle,
  listArticles,
  updateArticle,
  updateArticleStatus,
  type ArticleFilters,
} from "../services/articlesApi";
import { useAppContext } from "../context/AppContext";
import type { Article, ArticleStatus } from "../types/entities";

function sortArticles(articles: Article[], field: SortField, direction: "asc" | "desc"): Article[] {
  const sorted = [...articles];
  sorted.sort((a, b) => {
    const valueA =
      field === "network" ? a.network.name : field === "publishedAt" ? a.publishedAt || a.createdAt : a[field];
    const valueB =
      field === "network" ? b.network.name : field === "publishedAt" ? b.publishedAt || b.createdAt : b[field];
    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function ArticlesPage() {
  const { categories, networks, refreshReferenceData } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "">("");
  const [networkFilter, setNetworkFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("publishedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo<ArticleFilters>(() => {
    return {
      page,
      limit: 20,
      status: statusFilter || undefined,
      networkId: networkFilter || undefined,
      categoryId: categoryFilter || undefined,
      featured: featuredOnly ? true : undefined,
    };
  }, [page, statusFilter, networkFilter, categoryFilter, featuredOnly]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listArticles(filters);
      setArticles(response.articles);
      setPages(response.pagination.pages);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchArticles();
  }, [filters]);

  const visibleArticles = useMemo(() => {
    const queried =
      debouncedSearch.trim().length === 0
        ? articles
        : articles.filter((article) => {
            const text = `${article.title} ${article.content}`.toLowerCase();
            return text.includes(debouncedSearch.toLowerCase());
          });
    return sortArticles(queried, sortField, sortDirection);
  }, [articles, debouncedSearch, sortField, sortDirection]);

  const onSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const onToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const onSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(visibleArticles.map((item) => item.id));
  };

  const refreshAfterChange = async () => {
    setIsFormOpen(false);
    setEditingArticle(undefined);
    await fetchArticles();
    await refreshReferenceData();
  };

  const onDelete = async (article: Article) => {
    if (!window.confirm(`Supprimer "${article.title}" ?`)) return;
    try {
      await deleteArticle(article.id);
      await refreshAfterChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const onArchive = async (article: Article) => {
    try {
      await updateArticleStatus(article.id, "archived");
      await refreshAfterChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const onToggleFeatured = async (article: Article) => {
    try {
      await updateArticle(article.id, { featured: !article.featured });
      await refreshAfterChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const applyBulkStatus = async (status: ArticleStatus) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all(selectedIds.map((id) => updateArticleStatus(id, status)));
      await refreshAfterChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  if (loading && articles.length === 0) return <LoadingState label="Chargement des articles..." />;
  if (error && articles.length === 0) return <ErrorState message={error} onRetry={() => void fetchArticles()} />;

  return (
    <section className="stack">
      <div className="section-head">
        <h2>Gestion des articles</h2>
        <button
          type="button"
          onClick={() => {
            setEditingArticle(undefined);
            setIsFormOpen(true);
          }}
        >
          Nouvel article
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="filters-grid">
        <input
          aria-label="Recherche article"
          placeholder="Recherche titre ou contenu..."
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value as ArticleStatus | "");
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
        <select
          value={networkFilter}
          onChange={(event) => {
            setPage(1);
            setNetworkFilter(event.target.value);
          }}
        >
          <option value="">Tous les réseaux</option>
          {networks.map((network) => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(event) => {
            setPage(1);
            setCategoryFilter(event.target.value);
          }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(event) => {
              setPage(1);
              setFeaturedOnly(event.target.checked);
            }}
          />
          Mis en avant uniquement
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => void applyBulkStatus("draft")} disabled={selectedIds.length === 0}>
          Mettre en brouillon
        </button>
        <button type="button" onClick={() => void applyBulkStatus("published")} disabled={selectedIds.length === 0}>
          Publier sélection
        </button>
        <button type="button" onClick={() => void applyBulkStatus("archived")} disabled={selectedIds.length === 0}>
          Archiver sélection
        </button>
      </div>

      <ArticlesTable
        articles={visibleArticles}
        selectedIds={selectedIds}
        onSelectAll={onSelectAll}
        onToggleSelect={onToggleSelect}
        onSort={onSort}
        sortField={sortField}
        sortDirection={sortDirection}
        onEdit={(article) => {
          setEditingArticle(article);
          setIsFormOpen(true);
        }}
        onDelete={(article) => void onDelete(article)}
        onArchive={(article) => void onArchive(article)}
        onToggleFeatured={(article) => void onToggleFeatured(article)}
      />

      <div className="pagination-row">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1 || loading}
        >
          Précédent
        </button>
        <span>
          Page {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
          disabled={page >= pages || loading}
        >
          Suivant
        </button>
      </div>

      {isFormOpen ? (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="overlay-card">
            <ArticleForm
              categories={categories}
              networks={networks}
              article={editingArticle}
              onSaved={() => void refreshAfterChange()}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingArticle(undefined);
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
