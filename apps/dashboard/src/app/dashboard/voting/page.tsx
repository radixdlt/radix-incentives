"use client";

import { type FC, useState } from "react";
import { toast } from "sonner";

import { ConsultationCard } from "./components/ConsultationCard";
import { NoActiveConsultationMessage } from "./components/NoActiveConsultationMessage";
import { useDappToolkit } from "~/lib/hooks/useRdt";
import { ConnectedState } from "../components/ConnectedState";

// --- Exported Types (used by child components) ---
export type VotingOption = {
  id: string;
  text: string;
};

export type PlaceholderConsultation = {
  id: string;
  question: string;
  options: VotingOption[];
  startDate: Date;
  endDate: Date;
  rules: string;
  userVotingPower: number;
  userHasVoted: boolean;
};
// ---------------------------------------------------

/**
 * VotingPage Component
 * Displays the active community consultation UI with placeholder data.
 * Orchestrates rendering of sub-components.
 */
const VotingPage: FC = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading for vote submission
  const [hasVotedStatus, setHasVotedStatus] = useState<boolean>(false);
  const rdt = useDappToolkit();

  // --- Placeholder Data (remains in parent for now) ---
  const placeholderConsultation: PlaceholderConsultation | null = {
    id: "consultation_stablecoin_mvp_001",
    question:
      "Consultation: Should stablecoin reserves be utilized for upcoming incentive programs?",
    options: [
      { id: "opt_yes", text: "Yes, utilize stablecoin reserves" },
      { id: "opt_no", text: "No, do not utilize stablecoin reserves" },
      { id: "opt_abstain", text: "Abstain / Unsure" },
    ],
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    rules:
      "MVP Voting: Voting power is based on a snapshot of your XRD holdings. Future consultations may include LSUs/LPs and weighted averages.",
    userVotingPower: 25800,
    userHasVoted: hasVotedStatus,
  };
  // --------------------------------------------------

  /**
   * Placeholder handler for submitting a vote.
   * Simulates API call and updates local state.
   */
  const handleVoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOptionId) {
      toast.warning("Please select an option before submitting.");
      return;
    }
    if (!placeholderConsultation?.id) {
      toast.error("Cannot submit vote: Consultation data is missing.");
      return;
    }

    setIsLoading(true);
    toast.info("Submitting your vote...");

    // Simulate API call delay
    setTimeout(() => {
      console.log(
        `Simulated vote submission for consultation ${placeholderConsultation.id}, option ${selectedOptionId}`
      );
      setIsLoading(false);
      setHasVotedStatus(true);
      toast.success("Vote submitted successfully! (Simulated)");
      setSelectedOptionId(null);
    }, 1500);
  };

  return (
    <ConnectedState>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Community Consultation</h1>

        {placeholderConsultation ? (
          <ConsultationCard
            consultation={placeholderConsultation}
            selectedOptionId={selectedOptionId}
            isLoading={isLoading}
            onOptionChange={setSelectedOptionId}
            onSubmit={handleVoteSubmit}
          />
        ) : (
          <NoActiveConsultationMessage />
        )}

        {/* TODO: Add section for past consultations and results */}
      </div>
    </ConnectedState>
  );
};

export default VotingPage;
