import { z } from "zod";

const ConsultationId = {
  RepurposeTheStablecoinReserve: "Repurpose the Stablecoin Reserve",
  WaitForHyperlane: "WaitForHyperlane",
} as const;

const ConsultationOptionId = {
  Yes: "yes",
  No: "no",
} as const;

export type ConsultationOptionId =
  (typeof ConsultationOptionId)[keyof typeof ConsultationOptionId];

export const ConsultationOptionIdSchema = z.nativeEnum(ConsultationOptionId);

const ConsultationOptionSchema = z.object({
  id: ConsultationOptionIdSchema,
  text: z.string(),
});

const ConsultationOptions = [
  { id: ConsultationOptionId.Yes, text: "Yes" },
  { id: ConsultationOptionId.No, text: "No" },
];

export type ConsultationOption = z.infer<typeof ConsultationOptionSchema>;

export type ConsultationId =
  (typeof ConsultationId)[keyof typeof ConsultationId];

export const ConsultationIdSchema = z.nativeEnum(ConsultationId);

export const ConsultationSchema = z.object({
  consultationId: ConsultationIdSchema,
  title: z.string(),
  question: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  options: z.array(ConsultationOptionSchema),
});

export type Consultation = z.infer<typeof ConsultationSchema>;

export const consultationConfig = [
  {
    consultationId: ConsultationId.RepurposeTheStablecoinReserve,
    title: "Repurpose the Stablecoin Reserve",
    question: `Repurpose the Stablecoin Reserve. <a class="text-blue-500 text-lg hover:underline" href="https://www.radixdlt.com/blog/token-holder-consultation-repurposing-the-stablecoin-reserve" target="_blank" rel="noopener noreferrer">Learn more</a>`,
    startDate: new Date("2025-05-09T00:00:00Z"),
    endDate: new Date("2025-05-19T23:59:00Z"),
    options: ConsultationOptions,
  },
  {
    consultationId: ConsultationId.WaitForHyperlane,
    title: "Launch Radix Rewards with Hyperlane?",
    question:
      "The Radix Foundation believes that launching Radix Rewards with the Hyperlane bridge in place will dramatically increase its reach and impact. Do you support launching the campaign at the moment of highest cross-chain accessibility and network visibility?",
    startDate: new Date("2025-07-16T00:00:00Z"),
    endDate: new Date("2025-07-23T23:59:00Z"),
    options: ConsultationOptions,
  },
] satisfies Consultation[];

export const SelectedOptionSchema = z.object({
  consultationId: ConsultationIdSchema,
  selectedOption: ConsultationOptionIdSchema,
});

export type SelectedOption = z.infer<typeof SelectedOptionSchema>;
