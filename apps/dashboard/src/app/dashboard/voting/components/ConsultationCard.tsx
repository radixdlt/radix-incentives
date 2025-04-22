"use client";

import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { PlaceholderConsultation } from "../page"; // Assuming type export from parent
import { VotingForm } from "./VotingForm";
import { VotedMessage } from "./VotedMessage";

type ConsultationCardProps = {
  consultation: PlaceholderConsultation;
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
        <CardTitle>Active Consultation: {consultation.question}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Voting period: {consultation.startDate.toLocaleDateString()} -{" "}
          {consultation.endDate.toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Rules: {consultation.rules}
        </p>
        <p className="text-sm font-medium">
          Your Voting Power: {consultation.userVotingPower.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        {consultation.userHasVoted ? (
          <VotedMessage />
        ) : (
          <VotingForm
            options={consultation.options}
            selectedOptionId={selectedOptionId}
            isLoading={isLoading}
            onOptionChange={onOptionChange}
            onSubmit={onSubmit}
          />
        )}
      </CardContent>
    </Card>
  );
};
