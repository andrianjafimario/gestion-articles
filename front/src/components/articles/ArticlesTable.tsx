import type { CSSProperties } from "react";
import type { Article } from "../../types/entities";
import { StatusBadge } from "../common/StatusBadge";
import { formatDateTime } from "../../utils/date";

interface ArticlesTableProps {
  articles: Article[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string) => void;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onArchive: (article: Article) => void;
  onToggleFeatured: (article: Article) => void;
}

export type SortField = "title" | "status" | "network" | "publishedAt";

const HEADERS: Array<{ field: SortField; label: string }> = [
  { field: "title", label: "Titre" },
  { field: "publishedAt", label: "Publication" },
  { field: "status", label: "Statut" },
  { field: "network", label: "Réseau" },
];

export function ArticlesTable({
  articles,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onSort,
  sortField,
  sortDirection,
  onEdit,
  onDelete,
  onArchive,
  onToggleFeatured,
}: ArticlesTableProps) {
  const allChecked = articles.length > 0 && articles.every((item) => selectedIds.includes(item.id));

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>
              <input
                aria-label="Sélectionner tout"
                type="checkbox"
                checked={allChecked}
                onChange={(event) => onSelectAll(event.target.checked)}
              />
            </th>
            {HEADERS.map((header) => (
              <th key={header.field}>
                <button type="button" className="sort-button" onClick={() => onSort(header.field)}>
                  {header.label}
                  {sortField === header.field ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
                </button>
              </th>
            ))}
            <th>Catégories</th>
            <th>Mis en avant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>
                <input
                  aria-label={`Sélectionner ${article.title}`}
                  type="checkbox"
                  checked={selectedIds.includes(article.id)}
                  onChange={() => onToggleSelect(article.id)}
                />
              </td>
              <td>{article.title}</td>
              <td>{formatDateTime(article.publishedAt ?? article.createdAt)}</td>
              <td>
                <StatusBadge status={article.status} />
              </td>
              <td>{article.network?.name || "-"}</td>
              <td>
                <div className="inline-badges">
                  {article.categories.map((category) => (
                    <span
                      key={category.id}
                      className="mini-badge"
                      style={{ "--category-color": category.color } as CSSProperties}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </td>
              <td>{article.featured ? "Oui" : "Non"}</td>
              <td>
                <div className="action-row">
                  <button type="button" onClick={() => onEdit(article)}>
                    Éditer
                  </button>
                  <button type="button" onClick={() => onArchive(article)}>
                    Archiver
                  </button>
                  <button type="button" onClick={() => onToggleFeatured(article)}>
                    {article.featured ? "Retirer vedette" : "Mettre en avant"}
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(article)}>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
