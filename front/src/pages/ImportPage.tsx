import { useMemo, useState } from "react";
import { importArticles } from "../services/importApi";
import type { CreateArticlePayload } from "../services/articlesApi";
import { useAppContext } from "../context/AppContext";

interface RawImportRow {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  network: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ImportPage() {
  const { categories, networks } = useAppContext();
  const [rows, setRows] = useState<RawImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const converted = useMemo(() => {
    const payload: CreateArticlePayload[] = [];
    const mappingErrors: string[] = [];

    rows.forEach((row, index) => {
      const category = categories.find(
        (item) =>
          normalize(item.name) === normalize(row.category) || normalize(item.slug) === normalize(row.category),
      );
      const network = networks.find((item) => normalize(item.name) === normalize(row.network));

      if (!category || !network) {
        mappingErrors.push(`Ligne ${index + 1}: catégorie ou réseau introuvable`);
        return;
      }

      payload.push({
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        author: row.author,
        networkId: network.id,
        categoryIds: [category.id],
      });
    });

    return { payload, mappingErrors };
  }, [rows, categories, networks]);

  const onFileChange = async (file: File) => {
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as RawImportRow[];
      if (!Array.isArray(parsed)) throw new Error("Le fichier doit contenir un tableau JSON");
      setRows(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fichier invalide");
    }
  };

  const runImport = async () => {
    setError(null);
    setResult(null);
    if (rows.length === 0) {
      setError("Charge un fichier JSON avant l'import");
      return;
    }
    if (converted.mappingErrors.length > 0) {
      setError(converted.mappingErrors.join(" | "));
      return;
    }
    setLoading(true);
    try {
      const response = await importArticles(converted.payload);
      setResult(`${response.imported} article(s) importé(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <h2>Import de données JSON</h2>
      <p className="muted-text">
        Format attendu: title, content, excerpt, author, category (nom ou slug), network (nom du réseau).
      </p>
      {error ? <p className="error-text">{error}</p> : null}
      {result ? <p className="success-text">{result}</p> : null}

      <input
        type="file"
        accept="application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onFileChange(file);
          }
        }}
      />

      <button type="button" onClick={() => void runImport()} disabled={loading}>
        {loading ? "Import en cours..." : "Importer articles"}
      </button>

      <article className="panel">
        <h3>Résultat de pré-analyse</h3>
        <p>{rows.length} ligne(s) trouvée(s)</p>
        <p>{converted.payload.length} ligne(s) prêtes à importer</p>
        {converted.mappingErrors.length > 0 ? (
          <ul className="validation-list">
            {converted.mappingErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  );
}
