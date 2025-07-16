'use client';

import type { FC } from 'react';
import { Button } from '~/components/ui/button';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Label } from '~/components/ui/label';

type VotingFormProps = {
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
  isLoading: boolean;
  onOptionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const VotingForm: FC<VotingFormProps> = ({
  options,
  selectedOptionId,
  isLoading,
  onOptionChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <RadioGroup
        value={selectedOptionId ?? undefined}
        onValueChange={onOptionChange}
        className="space-y-2"
        disabled={isLoading}
      >
        <Label className="text-lg font-semibold">Select your choice:</Label>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.id}
              id={option.id}
              disabled={isLoading}
            />
            <Label
              htmlFor={option.id}
              className={`cursor-pointer ${isLoading ? 'text-muted-foreground' : ''}`}
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button
        type="submit"
        disabled={isLoading || !selectedOptionId}
        aria-label="Submit your consultation"
      >
        {isLoading ? 'Submitting...' : 'Submit Consultation'}
      </Button>
    </form>
  );
};
