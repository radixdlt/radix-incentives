"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface PersonaConnectionWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PersonaConnectionWarning({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: PersonaConnectionWarningProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <AlertDialogTitle>Connect Persona</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            You are about to connect a Persona from your Radix Wallet. Please
            note:
          </AlertDialogDescription>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>
              Your Persona's name will be displayed on the public leaderboards.
            </li>
            <li>To update the name, reconnect your renamed Persona.</li>
            <li>Accounts linked to your Persona will remain private.</li>
          </ul>
          <div className="text-sm font-medium">
            Do you want to continue connecting your Persona?
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Yes, Connect Persona
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook to use the warning dialog
export function usePersonaConnectionWarning() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showWarning = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
    setResolvePromise(null);
  };

  const WarningDialog = () => (
    <PersonaConnectionWarning
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return {
    showWarning,
    WarningDialog,
  };
}
