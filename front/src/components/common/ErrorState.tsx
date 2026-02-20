interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-box error" role="alert">
      <strong>Erreur:</strong> {message}
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
