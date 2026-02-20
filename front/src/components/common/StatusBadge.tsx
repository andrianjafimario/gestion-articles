import type { ArticleStatus } from "../../types/entities";

interface StatusBadgeProps {
  status: ArticleStatus | "sent" | "failed";
}

const LABELS: Record<StatusBadgeProps["status"], string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
  sent: "Envoyé",
  failed: "Échoué",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{LABELS[status]}</span>;
}
