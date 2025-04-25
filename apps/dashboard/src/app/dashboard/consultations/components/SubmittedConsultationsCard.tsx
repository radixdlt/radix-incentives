import type { FC } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { VotingOption } from "../page"; // Assuming types are exported from page.tsx for now

// --- Component Types ---
type SubmittedConsultation = {
  consultationId: string;
  selectedOption: string;
  rolaProof: unknown;
  id: string;
  timestamp: Date;
  accountAddress: string;
};

type SubmittedConsultationsCardProps = {
  consultations: SubmittedConsultation[];
};
// ----------------------

/**
 * Finds the text of the selected option.
 */
const getSelectedOptionText = (
  options: VotingOption[],
  selectedOptionId: string
): string => {
  const option = options.find((opt) => opt.id === selectedOptionId);
  return option ? option.text : "Unknown Option";
};

/**
 * SubmittedConsultationsCard Component
 * Displays a card listing consultations the user has previously voted on.
 */
export const SubmittedConsultationsCard: FC<
  SubmittedConsultationsCardProps
> = ({ consultations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your History</CardTitle>
      </CardHeader>
      <CardContent>
        {consultations.length > 0 ? (
          <ScrollArea className="h-72 pr-4">
            {" "}
            {/* Added padding-right */}
            <div className="space-y-4">
              {consultations.map((consultation, index) => (
                <div key={consultation.id} className="space-y-2">
                  <div>
                    <p className="font-medium">{consultation.consultationId}</p>
                    <p className="text-sm text-muted-foreground">
                      Voted on: {consultation.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {consultation.accountAddress}
                    </p>
                    <pre className="text-sm text-muted-foreground">
                      {JSON.stringify(consultation.rolaProof, null, 2)}
                    </pre>
                  </div>
                  <Badge variant="secondary">
                    Your consultation:{" "}
                    {getSelectedOptionText(
                      [
                        { id: "1", text: "Yes" },
                        { id: "2", text: "No" },
                      ],
                      consultation.selectedOption
                    )}
                  </Badge>
                  {index < consultations.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground">
            You haven't submitted any consultations yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
