import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { z } from "zod";
import type { Article, ArticleStatus, Category, Network } from "../../types/entities";
import { createArticle, updateArticle, updateArticleStatus, type CreateArticlePayload } from "../../services/articlesApi";

const articleSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères"),
  excerpt: z.string().min(10, "Le résumé doit contenir au moins 10 caractères"),
  author: z.string().min(2, "L'auteur est obligatoire"),
  networkId: z.string().min(1, "Le réseau est obligatoire"),
  categoryIds: z.array(z.string()).min(1, "Sélectionne au moins une catégorie"),
});

interface ArticleFormProps {
  categories: Category[];
  networks: Network[];
  article?: Article;
  onSaved: () => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  networkId: string;
  categoryIds: string[];
  featured: boolean;
  status: ArticleStatus;
}

function buildInitialState(article?: Article): FormState {
  if (!article) {
    return {
      title: "",
      content: "",
      excerpt: "",
      author: "",
      networkId: "",
      categoryIds: [],
      featured: false,
      status: "draft",
    };
  }
  return {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    author: article.author,
    networkId: article.networkId,
    categoryIds: article.categories.map((item) => item.id),
    featured: article.featured,
    status: article.status,
  };
}

export function ArticleForm({ categories, networks, article, onSaved, onCancel }: ArticleFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(article));
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftKey = `article_draft_${article?.id ?? "new"}`;

  useEffect(() => {
    const draftRaw = localStorage.getItem(draftKey);
    if (draftRaw) {
      try {
        const savedDraft = JSON.parse(draftRaw) as FormState;
        setForm(savedDraft);
        setDirty(true);
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, [draftKey]);

  useEffect(() => {
    if (!dirty) return;
    const timer = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify(form));
    }, 30000);
    return () => clearInterval(timer);
  }, [draftKey, form, dirty]);

  const validationErrors = useMemo(() => {
    const result = articleSchema.safeParse(form);
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.message);
  }, [form]);

  const toggleCategory = (id: string) => {
    setDirty(true);
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((item) => item !== id)
          : [...prev.categoryIds, id],
      };
    });
  };

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = articleSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Formulaire invalide");
      return;
    }

    setLoading(true);
    try {
      let saved: Article;
      const payload: CreateArticlePayload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt,
        author: form.author,
        networkId: form.networkId,
        categoryIds: form.categoryIds,
        featured: form.featured,
      };

      if (article) {
        saved = await updateArticle(article.id, payload);
      } else {
        saved = await createArticle(payload);
      }

      if (saved.status !== form.status) {
        await updateArticleStatus(saved.id, form.status);
      }

      localStorage.removeItem(draftKey);
      setDirty(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-form">
      <section>
        <h3>{article ? "Modifier l'article" : "Créer un article"}</h3>
        {dirty ? <p className="dirty-note">Modifications non sauvegardées</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <label htmlFor="article-title">Titre</label>
        <input
          id="article-title"
          value={form.title}
          onChange={(event) => handleChange("title", event.target.value)}
          aria-label="Titre de l'article"
        />

        <label htmlFor="article-excerpt">Résumé</label>
        <textarea
          id="article-excerpt"
          value={form.excerpt}
          onChange={(event) => handleChange("excerpt", event.target.value)}
          rows={3}
        />

        <label htmlFor="article-content">Contenu</label>
        <textarea
          id="article-content"
          value={form.content}
          onChange={(event) => handleChange("content", event.target.value)}
          rows={10}
        />

        <div className="form-grid two">
          <div>
            <label htmlFor="article-author">Auteur</label>
            <input
              id="article-author"
              value={form.author}
              onChange={(event) => handleChange("author", event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="article-network">Réseau</label>
            <select
              id="article-network"
              value={form.networkId}
              onChange={(event) => handleChange("networkId", event.target.value)}
            >
              <option value="">Sélectionner</option>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="article-status">Statut</label>
        <select
          id="article-status"
          value={form.status}
          onChange={(event) => handleChange("status", event.target.value as ArticleStatus)}
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>

        <div className="checkbox-row">
          <input
            id="article-featured"
            type="checkbox"
            checked={form.featured}
            onChange={(event) => handleChange("featured", event.target.checked)}
          />
          <label htmlFor="article-featured">Article mis en avant</label>
        </div>

        <div>
          <label>Catégories</label>
          <div className="badge-list">
            {categories.map((category) => {
              const active = form.categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={active ? "badge category-badge active" : "badge category-badge"}
                  onClick={() => toggleCategory(category.id)}
                  style={{ "--category-color": category.color } as CSSProperties}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {validationErrors.length > 0 ? (
          <ul className="validation-list">
            {validationErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        <div className="button-row">
          <button type="button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Prévisualisation article">
        <h3>Prévisualisation en direct</h3>
        <article>
          <h4>{form.title || "Titre de l'article"}</h4>
          <p>{form.excerpt || "Résumé de l'article..."}</p>
          <div className="meta-line">
            <span>{form.author || "Auteur"}</span>
            <span>{form.status}</span>
          </div>
          <hr />
          <p>{form.content || "Contenu..."}</p>
        </article>
      </aside>
    </div>
  );
}
