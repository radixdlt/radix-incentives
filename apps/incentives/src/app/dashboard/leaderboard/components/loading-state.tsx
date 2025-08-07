'use client';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}
