"use client";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}