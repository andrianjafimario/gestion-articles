import { lazy, Suspense, useMemo, useState } from "react";
import { useAppContext } from "./context/AppContext";
import { LoadingState } from "./components/common/LoadingState";
import { ErrorState } from "./components/common/ErrorState";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage").then((module) => ({ default: module.ArticlesPage })));
const CategoriesPage = lazy(() =>
  import("./pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage })),
);
const NotificationsPage = lazy(() =>
  import("./pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage })),
);
const ImportPage = lazy(() => import("./pages/ImportPage").then((module) => ({ default: module.ImportPage })));

type TabKey = "dashboard" | "articles" | "categories" | "notifications" | "import";

const TAB_LABELS: Record<TabKey, string> = {
  dashboard: "Dashboard",
  articles: "Articles",
  categories: "Catégories & Réseaux",
  notifications: "Notifications",
  import: "Import JSON",
};

function App() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { loading, error, refreshReferenceData } = useAppContext();

  const CurrentPage = useMemo(() => {
    if (tab === "dashboard") return DashboardPage;
    if (tab === "articles") return ArticlesPage;
    if (tab === "categories") return CategoriesPage;
    if (tab === "notifications") return NotificationsPage;
    return ImportPage;
  }, [tab]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Back-office administrateur</h1>
          <p>Gestion éditoriale, notifications email et import de données</p>
        </div>
        <button type="button" onClick={() => void refreshReferenceData()}>
          Rafraîchir données globales
        </button>
      </header>

      <nav className="tabbar" aria-label="Navigation principale">
        {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </nav>

      <main>
        {loading ? <LoadingState label="Initialisation des données de référence..." /> : null}
        {error ? <ErrorState message={error} onRetry={() => void refreshReferenceData()} /> : null}
        <Suspense fallback={<LoadingState label="Chargement du module..." />}>
          <CurrentPage />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
