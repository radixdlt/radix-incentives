"use client";

import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { VotingForm } from "./VotingForm";
import { VotedMessage } from "./VotedMessage";

type ConsultationCardProps = {
  consultation: {
    question: string;
    startDate: Date;
    endDate: Date;
    options: {
      id: string;
      text: string;
    }[];
  };
  selectedOptionId: string | null;
  isLoading: boolean;
  onOptionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

/**
 * Renders the main card displaying consultation details and voting options or status.
 */
export const ConsultationCard: FC<ConsultationCardProps> = ({
  consultation,
  selectedOptionId,
  isLoading,
  onOptionChange,
  onSubmit,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: consultation.question }}
        />
        <p className="text-sm text-muted-foreground">
          Consultation Period: {consultation.startDate.toLocaleDateString()} -{" "}
          {consultation.endDate.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <VotingForm
          options={consultation.options}
          selectedOptionId={selectedOptionId}
          isLoading={isLoading}
          onOptionChange={onOptionChange}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
};
