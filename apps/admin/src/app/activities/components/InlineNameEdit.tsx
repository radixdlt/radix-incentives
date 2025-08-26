'use client';

import { Check, Pencil, X } from 'lucide-react';
import type * as React from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

type Activity = {
  id: string;
  name?: string | null;
  description?: string | null;
  category: string;
  dapp?: string | null;
  componentAddresses: unknown;
  data: unknown;
};

type InlineNameEditProps = {
  activity: Activity;
  isEditing: boolean;
  editingName: string;
  onStartEdit: (e: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
};

export function InlineNameEdit({
  activity,
  isEditing,
  editingName,
  onStartEdit,
  onSave,
  onCancel,
  onNameChange,
}: InlineNameEditProps) {
  if (isEditing) {
    return (
      <div className="inline-edit flex items-center gap-2">
        <Input
          value={editingName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-8 min-w-[200px]"
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between">
      <span>{activity.name ?? ''}</span>
      <Button
        size="icon"
        variant="ghost"
        className="inline-edit h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={onStartEdit}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
