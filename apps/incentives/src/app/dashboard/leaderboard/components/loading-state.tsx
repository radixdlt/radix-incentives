"use client";

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}