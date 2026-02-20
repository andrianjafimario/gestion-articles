import { useMemo, useState } from "react";
import type { Network } from "../../types/entities";
import { createNetwork, deleteNetwork, updateNetwork, type NetworkPayload } from "../../services/networksApi";

interface NetworkManagerProps {
  networks: Network[];
  onChanged: () => Promise<void>;
}

const EMPTY_FORM: NetworkPayload = {
  name: "",
  description: "",
};

export function NetworkManager({ networks, onChanged }: NetworkManagerProps) {
  const [form, setForm] = useState<NetworkPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(
    () => form.name.trim().length > 0 && form.description.trim().length > 0,
    [form],
  );

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
        await updateNetwork(editingId, form);
      } else {
        await createNetwork(form);
      }
      resetForm();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (network: Network) => {
    setForm({
      name: network.name,
      description: network.description,
    });
    setEditingId(network.id);
  };

  const remove = async (network: Network) => {
    const count = network._count?.articles ?? 0;
    if (count > 0) return;
    setLoading(true);
    setError(null);
    try {
      await deleteNetwork(network.id);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <h2>Gestion des réseaux</h2>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="form-grid two">
        <input
          value={form.name}
          placeholder="Nom du réseau"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          value={form.description}
          placeholder="Description"
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>
      <div className="button-row">
        {editingId ? (
          <button type="button" onClick={resetForm} disabled={loading}>
            Annuler édition
          </button>
        ) : null}
        <button type="button" onClick={() => void submit()} disabled={loading || !isValid}>
          {editingId ? "Mettre à jour" : "Créer réseau"}
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Articles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((network) => {
              const articleCount = network._count?.articles ?? 0;
              return (
                <tr key={network.id}>
                  <td>{network.name}</td>
                  <td>{network.description}</td>
                  <td>{articleCount}</td>
                  <td>
                    <div className="action-row">
                      <button type="button" onClick={() => startEdit(network)}>
                        Éditer
                      </button>
                      <button type="button" onClick={() => void remove(network)} disabled={articleCount > 0}>
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
