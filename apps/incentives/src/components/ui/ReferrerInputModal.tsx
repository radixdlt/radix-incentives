'use client';

import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { useReferralCode } from '~/lib/hooks/useReferralCode';
import { Input } from './input';

export function ReferrerInputModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { referralCode: cookieReferralCode, setCookie } = useReferralCode();

  useEffect(() => {
    setReferralCode(cookieReferralCode || '');
  }, [cookieReferralCode]);

  const handleConfirm = () => {
    setCookie(referralCode);

    onConfirm();
  };

  const [referralCode, setReferralCode] = useState(cookieReferralCode || '');
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <Info className="h-6 w-6 text-blue-600" />
            <AlertDialogTitle>Referral code</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <span className="block">Enter an optional referral code.</span>
            <Input
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook to use the warning dialog
export function useReferrerInputModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showModal = (): Promise<boolean> => {
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

  const Modal = () => (
    <ReferrerInputModal
      open={isOpen}
      onOpenChange={handleConfirm}
      onConfirm={handleConfirm}
    />
  );

  return {
    showModal,
    Modal,
  };
}
