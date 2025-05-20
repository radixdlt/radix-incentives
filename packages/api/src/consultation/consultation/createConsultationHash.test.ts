import { toHex } from "../../common/crypto";
import { createConsultationMessageHash } from "./createConsultationHash";

describe("createConsultationMessageHash", () => {
  const consultationId = "Repurpose the Stablecoin Reserve";
  it("should create a hash of the consultation message", async () => {
    const yesHash = createConsultationMessageHash({
      consultationId,
      selectedOption: "yes",
    });

    const noHash = createConsultationMessageHash({
      consultationId,
      selectedOption: "no",
    });

    await Promise.all([yesHash, noHash]).then(([yesHash, noHash]) => {
      console.log("yesHash", toHex(yesHash));
      console.log("noHash", toHex(noHash));
    });
  });
});
