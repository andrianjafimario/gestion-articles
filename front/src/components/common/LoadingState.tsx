interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
