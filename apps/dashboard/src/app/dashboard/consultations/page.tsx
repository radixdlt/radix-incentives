"use client";

import { type FC, useState, useMemo } from "react";
import { toast } from "sonner";

import { ConsultationCard } from "./components/ConsultationCard";
import { NoActiveConsultationMessage } from "./components/NoActiveConsultationMessage";
import { SubmittedConsultationsCard } from "./components/SubmittedConsultationsCard";
import { useDappToolkit } from "~/lib/hooks/useRdt";
import { ConnectedState } from "../components/ConnectedState";
import { OneTimeDataRequestBuilder } from "@radixdlt/radix-dapp-toolkit";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

// --- Types (Adjust based on actual API response) ---
// Assuming the API returns a structure similar to PlaceholderConsultation
// but potentially with different field names or nullability.
export type VotingOption = {
  id: string;
  text: string;
};

// Type for API response (adapt as needed)
export type Consultation = {
  id: string;
  question: string;
  options: VotingOption[];
  startDate: Date;
  endDate: Date;
  rules: string;
  userVotingPower: number | null; // May be null if not applicable/calculated
  userHasVoted: boolean;
  submittedAt?: Date | null; // May be null if not voted
  selectedOptionId?: string | null; // May be null if not voted
  // Add other fields from the API response if necessary
};

// Type specifically for SubmittedConsultationsCard props
export type SubmittedConsultation = Consultation & {
  submittedAt: Date; // Ensure these are present for submitted items
  selectedOptionId: string;
};
// ---------------------------------------------------

/**
 * VotingPage Component
 * Displays active and submitted community consultations fetched from the API.
 */
const VotingPage: FC = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Renamed from isLoading for clarity
  const generateChallenge = api.auth.generateChallenge.useMutation();
  const connectedAccounts = api.account.getAccounts.useQuery();
  const createConsultationHash =
    api.consultation.createConsultationHash.useMutation({ retry: false });
  const rdt = useDappToolkit();
  const verifyConsultationSignature =
    api.consultation.verifyConsultationSignature.useMutation({ retry: false });

  const {
    data: consultationsData,
    isLoading: isLoadingConsultations,
    error: consultationError,
    refetch: refetchConsultations,
  } = api.consultation.getConsultations.useQuery();

  /**
   * Handler for submitting a vote, now uses activeConsultation.
   */
  const handleVoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOptionId) {
      toast.warning("Please select an option before submitting.");
      return;
    }

    setIsSubmitting(true); // Use isSubmitting state
    toast.info("Submitting your vote...");

    const userConsultationValue = {
      consultationId: "proposal_1",
      selectedOption: selectedOptionId,
    };

    try {
      // Create the hash of the user's consultation value
      const hash = await createConsultationHash.mutateAsync(
        userConsultationValue
      );

      const registeredAccountAddresses =
        connectedAccounts.data?.map((account) => account.address) ?? [];

      // Provide challenge *before* sending request
      rdt?.walletApi.provideChallengeGenerator(async () => hash);

      const walletResponse = await rdt?.walletApi.sendOneTimeRequest(
        OneTimeDataRequestBuilder.proofOfOwnership().accounts(
          registeredAccountAddresses
        )
      );

      if (walletResponse?.isOk()) {
        const proofs = walletResponse.value.proofs;
        await verifyConsultationSignature.mutateAsync({
          consultationId: userConsultationValue.consultationId,
          selectedOption: userConsultationValue.selectedOption,
          rolaProof: {
            challenge: hash,
            items: proofs.map((proof) => ({
              type: proof.type,
              label:
                connectedAccounts.data?.find(
                  (account) => account.address === proof.address
                )?.label ?? "",
              address: proof.address,
              proof: proof.proof,
            })),
          },
        });
        toast.success("Consultation submitted successfully!");
        // Optimistically update or refetch consultations after successful vote
        // e.g., getConsultations.refetch(); or manually update state
        // For simplicity, we'll rely on potential future refetch/cache invalidation
        setSelectedOptionId(null); // Reset selection
      } else if (walletResponse?.isErr()) {
        // Handle wallet errors if possible (e.g., user rejection)
        toast.error(
          walletResponse.error.message ?? "Wallet interaction failed."
        );
      }
    } catch (error) {
      console.error("Vote Submission Error:", error);
      // More specific error handling based on caught error type if needed
      toast.error("Error submitting vote. Please try again.");
    } finally {
      // Always reset challenge generator and loading state
      rdt?.walletApi.provideChallengeGenerator(() =>
        generateChallenge.mutateAsync()
      );
      setIsSubmitting(false);
      refetchConsultations();
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoadingConsultations) {
      return (
        <div className="space-y-6">
          {/* Skeleton for Active Consultation */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-1/3 mt-4" />
            </CardContent>
          </Card>
          {/* Separator */}
          <div className="py-4">
            <hr />
          </div>
          {/* Skeleton for Submitted Consultations */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Data loaded successfully
    return (
      <div className="space-y-6">
        <ConsultationCard
          // Cast activeConsultation to the type expected by ConsultationCard if necessary
          // This assumes ConsultationCard expects a type compatible with 'Consultation'
          consultation={{
            question: "Use strategic stablecoin reserve?",
            startDate: new Date(),
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            options: [
              { id: "1", text: "Yes" },
              { id: "2", text: "No" },
            ],
          }}
          selectedOptionId={selectedOptionId}
          isLoading={isSubmitting} // Pass submission loading state
          onOptionChange={setSelectedOptionId}
          onSubmit={handleVoteSubmit}
        />

        {/* Separator */}
        <div className="py-4">
          <hr />
        </div>

        <SubmittedConsultationsCard
          consultations={
            consultationsData?.map((consultation) => ({
              ...consultation,
              submittedAt: consultation.timestamp,
              selectedOptionId: consultation.selectedOption,
            })) ?? []
          }
        />
      </div>
    );
  };

  return (
    <ConnectedState>
      <h1 className="text-3xl font-bold mb-6">Community Consultation</h1>
      {renderContent()}
    </ConnectedState>
  );
};

export default VotingPage;
