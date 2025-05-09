import { z } from "zod";
import { consultationConfig } from "./config";

export const repurposeTheStablecoinReserveSchema = z.object({
  consultationId: z.literal(
    consultationConfig.RepurposeTheStablecoinReserve.consultationId
  ),
  selectedOption: z.union([
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    z.literal(consultationConfig.RepurposeTheStablecoinReserve.options[0]!.id),
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    z.literal(consultationConfig.RepurposeTheStablecoinReserve.options[1]!.id),
  ]),
});

export type RepurposeTheStablecoinReserve = z.infer<
  typeof repurposeTheStablecoinReserveSchema
>;
