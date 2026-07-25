import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * AES-256-GCM encrypt/decrypt for gateway credentials, keyed by
 * PAYMENTS_ENCRYPTION_KEY (base64, must decode to exactly 32 bytes). Random IV
 * per call, auth tag stored alongside the ciphertext (payload = iv|tag|ciphertext,
 * base64). If the key is unset or the wrong length, both functions throw —
 * callers (api/payments/connections.ts) must turn that into a 501, never fall
 * back to storing plaintext.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey(): Buffer {
  const b64 = process.env.PAYMENTS_ENCRYPTION_KEY
  if (!b64) throw new Error('PAYMENTS_ENCRYPTION_KEY is not configured')
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) throw new Error('PAYMENTS_ENCRYPTION_KEY must decode to 32 bytes (AES-256)')
  return key
}

export function encryptCredentials(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

export function decryptCredentials(payload: string): string {
  const key = getKey()
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
