import { concatBytes } from '@noble/hashes/utils';
import { blake2bDigest } from '../../common/crypto/blake2bDigest';

export const createConsultationMessageHash = ({
  selectedOption,
  consultationId,
}: {
  selectedOption: string;
  consultationId: string;
}) => {
  const encoder = new TextEncoder();

  return blake2bDigest(
    concatBytes(encoder.encode(consultationId), encoder.encode(selectedOption)),
  );
};
