"use client";

import type { FC } from "react";

/**
 * Displays a message indicating the user has already voted.
 */
export const VotedMessage: FC = () => {
  return (
    <p className="text-green-600 font-semibold">
      You have already voted in this consultation. (Simulated)
    </p>
  );
};
