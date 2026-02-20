import { useMemo, useState } from "react";
import { notifyArticle } from "../../services/articlesApi";
import { generateNotificationPreviewHtml } from "../../utils/notificationTemplate";
import { formatDateTime } from "../../utils/date";
import type { Article, EmailNotification } from "../../types/entities";
import { StatusBadge } from "../common/StatusBadge";

interface NotificationsModuleProps {
  articles: Article[];
  notifications: EmailNotification[];
  onRefresh: () => Promise<void>;
}

function parseRecipients(value: string[] | string): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function NotificationsModule({ articles, notifications, onRefresh }: NotificationsModuleProps) {
  const [articleId, setArticleId] = useState("");
  const [subject, setSubject] = useState("");
  const [rawRecipients, setRawRecipients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === articleId),
    [articleId, articles],
  );

  const recipients = useMemo(
    () =>
      rawRecipients
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    [rawRecipients],
  );

  const previewHtml = useMemo(() => {
    if (!selectedArticle) return "";
    return generateNotificationPreviewHtml(
      selectedArticle.title,
      selectedArticle.excerpt,
      selectedArticle.author,
      `${window.location.origin}/articles/${selectedArticle.id}`,
    );
  }, [selectedArticle]);

  const onArticleChange = (id: string) => {
    setArticleId(id);
    const article = articles.find((item) => item.id === id);
    if (article) {
      setSubject(`Nouvel article: ${article.title}`);
    }
  };

  const send = async () => {
    setError(null);
    setSuccess(null);
    if (!articleId) {
      setError("Sélectionne un article");
      return;
    }
    if (subject.trim().length === 0) {
      setError("Le sujet est obligatoire");
      return;
    }
    if (recipients.length === 0) {
      setError("Ajoute au moins un destinataire");
      return;
    }

    setLoading(true);
    try {
      await notifyArticle(articleId, { recipients, subject: subject.trim() });
      setSuccess("Notification envoyée");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <h2>Module de notifications</h2>
      <div className="split-form">
        <section>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
          <label htmlFor="notification-article">Article</label>
          <select
            id="notification-article"
            value={articleId}
            onChange={(event) => onArticleChange(event.target.value)}
          >
            <option value="">Sélectionner un article</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>

          <label htmlFor="notification-subject">Sujet</label>
          <input
            id="notification-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />

          <label htmlFor="notification-recipients">Destinataires (emails séparés par virgules)</label>
          <textarea
            id="notification-recipients"
            rows={4}
            value={rawRecipients}
            onChange={(event) => setRawRecipients(event.target.value)}
          />

          <button type="button" onClick={() => void send()} disabled={loading}>
            {loading ? "Envoi..." : "Envoyer notification"}
          </button>
        </section>

        <aside className="preview-panel">
          <h3>Prévisualisation email HTML</h3>
          {previewHtml ? (
            <iframe title="Prévisualisation email" srcDoc={previewHtml} className="preview-iframe" />
          ) : (
            <p>Sélectionne un article pour prévisualiser.</p>
          )}
        </aside>
      </div>

      <h3>Historique des notifications</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Sujet</th>
              <th>Destinataires</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => {
              const recipientsCount = parseRecipients(notification.recipients).length;
              return (
                <tr key={notification.id}>
                  <td>{notification.article?.title || notification.articleId}</td>
                  <td>{notification.subject}</td>
                  <td>{recipientsCount}</td>
                  <td>{formatDateTime(notification.sentAt)}</td>
                  <td>
                    <StatusBadge status={notification.status} />
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
