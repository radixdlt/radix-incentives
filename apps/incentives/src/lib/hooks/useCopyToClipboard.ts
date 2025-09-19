import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.info('Copied to clipboard');
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { isCopied, copyToClipboard };
};
