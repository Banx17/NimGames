import { Hash, PublicKey, Signature } from "@nimiq/core";

export const NIMIQ_MESSAGE_PREFIX = "\x16Nimiq Signed Message:\n";
export const NIMIQ_SIGNATURE_HEX_LENGTH = 128;
export const NIMIQ_PUBLIC_KEY_HEX_LENGTH = 64;

export function normalizeAddress(address: string): string {
  return address.toUpperCase().replace(/\s+/g, "");
}

function isValidHex(value: string, length: number): boolean {
  return new RegExp(`^[0-9a-fA-F]{${length}}$`).test(value);
}

export function buildSignedMessageData(message: string): Uint8Array {
  const data = Buffer.from(NIMIQ_MESSAGE_PREFIX + String(message.length) + message, "utf8");
  return Hash.computeSha256(new Uint8Array(data));
}

export interface VerifyWalletSignatureInput {
  message: string;
  signatureHex: string;
  publicKeyHex: string;
  address: string;
}

export function verifyWalletSignature({
  message,
  signatureHex,
  publicKeyHex,
  address,
}: VerifyWalletSignatureInput): boolean {
  if (
    typeof message !== "string" ||
    message.length === 0 ||
    !isValidHex(signatureHex, NIMIQ_SIGNATURE_HEX_LENGTH) ||
    !isValidHex(publicKeyHex, NIMIQ_PUBLIC_KEY_HEX_LENGTH)
  ) {
    return false;
  }

  try {
    const signature = Signature.fromHex(signatureHex);
    const publicKey = PublicKey.fromHex(publicKeyHex);
    const signedData = buildSignedMessageData(message);

    if (!publicKey.verify(signature, signedData)) {
      return false;
    }

    const derivedAddress = normalizeAddress(publicKey.toAddress().toUserFriendlyAddress());
    return derivedAddress === normalizeAddress(address);
  } catch {
    return false;
  }
}