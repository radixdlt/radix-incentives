import { Check, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

type InlineNameEditProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const InlineNameEdit = ({
  value,
  onChange,
  onSave,
  onCancel,
}: InlineNameEditProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Focus the input when editing starts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <fieldset
      className="inline-edit flex items-center gap-2 border-none p-0"
      onClick={handleInputClick}
      onKeyDown={handleContainerKeyDown}
    >
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 w-auto min-w-32 max-w-64"
        placeholder="Category name"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleButtonClick(e, onSave)}
        className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleButtonClick(e, onCancel)}
        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
      >
        <X className="h-3 w-3" />
      </Button>
    </fieldset>
  );
};
