/**
 * NaCl encryption for GitHub Secrets API
 * GitHub requires secrets to be encrypted with the repo's public key using libsodium sealed boxes.
 */
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * Encrypt a secret value for the GitHub Secrets API using NaCl sealed box.
 * @param value - The plaintext secret value
 * @param publicKeyBase64 - The repo's public key from GitHub (base64)
 * @returns base64-encoded encrypted value ready for the GitHub API
 */
export function encryptSecretForGitHub(value: string, publicKeyBase64: string): string {
  const messageBytes = naclUtil.decodeUTF8(value);
  const publicKeyBytes = naclUtil.decodeBase64(publicKeyBase64);

  // Generate ephemeral keypair for sealed box
  const ephemeralKeyPair = nacl.box.keyPair();

  // Create nonce from first 24 bytes of SHA-256(ephemeral_pk || public_key)
  // For sealed boxes, the nonce is derived from the ephemeral public key and the recipient's public key
  const nonceInput = new Uint8Array(64);
  nonceInput.set(ephemeralKeyPair.publicKey, 0);
  nonceInput.set(publicKeyBytes, 32);

  // Use crypto.subtle to compute the hash
  // Since we need synchronous, use nacl.box directly with a derived nonce
  const nonce = nacl.hash(nonceInput).slice(0, nacl.box.nonceLength);

  const encrypted = nacl.box(messageBytes, nonce, publicKeyBytes, ephemeralKeyPair.secretKey);

  // Sealed box format: ephemeral_pk || encrypted_message
  const sealedBox = new Uint8Array(ephemeralKeyPair.publicKey.length + encrypted.length);
  sealedBox.set(ephemeralKeyPair.publicKey, 0);
  sealedBox.set(encrypted, ephemeralKeyPair.publicKey.length);

  return naclUtil.encodeBase64(sealedBox);
}
