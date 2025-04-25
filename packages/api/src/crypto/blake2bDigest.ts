import { blake2b } from "blakejs";

/**
 * Generates a 32-byte BLAKE2b hash digest of a message.
 * @param message - The string message to hash.
 * @returns A 32-byte Uint8Array containing the hash digest.
 */
export const blake2bDigest = async (bytes: Uint8Array): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    try {
      // Calculate BLAKE2b hash with a 32-byte output length
      const digest = blake2b(bytes, undefined, 32);
      resolve(digest);
    } catch (error) {
      reject(error);
    }
  });
};
