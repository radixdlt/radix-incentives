'use client';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}
