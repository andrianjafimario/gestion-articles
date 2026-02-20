import { useMemo, useState } from "react";
import type { Category } from "../../types/entities";
import { createCategory, deleteCategory, updateCategory, type CategoryPayload } from "../../services/categoriesApi";

interface CategoryManagerProps {
  categories: Category[];
  articleCountByCategory: Record<string, number>;
  onChanged: () => Promise<void>;
}

const EMPTY_FORM: CategoryPayload = {
  name: "",
  slug: "",
  description: "",
  color: "#0f6abf",
};

export function CategoryManager({ categories, articleCountByCategory, onChanged }: CategoryManagerProps) {
  const [form, setForm] = useState<CategoryPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.slug.trim().length > 0 &&
      form.description.trim().length > 0 &&
      /^#[0-9A-Fa-f]{6}$/.test(form.color)
    );
  }, [form]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
  };

  const submit = async () => {
    if (!isValid) {
      setError("Formulaire invalide");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      resetForm();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category: Category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
    });
    setEditingId(category.id);
  };

  const remove = async (category: Category) => {
    const count = articleCountByCategory[category.id] ?? 0;
    if (count > 0) return;
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(category.id);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <h2>Gestion des catégories</h2>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="form-grid four">
        <input
          value={form.name}
          placeholder="Nom"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          value={form.slug}
          placeholder="Slug"
          onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
        />
        <input
          value={form.description}
          placeholder="Description"
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        <input
          value={form.color}
          type="color"
          onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
        />
      </div>
      <div className="button-row">
        {editingId ? (
          <button type="button" onClick={resetForm} disabled={loading}>
            Annuler édition
          </button>
        ) : null}
        <button type="button" onClick={() => void submit()} disabled={loading || !isValid}>
          {editingId ? "Mettre à jour" : "Créer catégorie"}
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Couleur</th>
              <th>Articles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const articleCount = articleCountByCategory[category.id] ?? 0;
              return (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.description}</td>
                  <td>
                    <span className="color-dot" style={{ backgroundColor: category.color }} />
                    {category.color}
                  </td>
                  <td>{articleCount}</td>
                  <td>
                    <div className="action-row">
                      <button type="button" onClick={() => startEdit(category)}>
                        Éditer
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(category)}
                        disabled={articleCount > 0}
                        title={articleCount > 0 ? "Impossible de supprimer une catégorie utilisée" : ""}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
