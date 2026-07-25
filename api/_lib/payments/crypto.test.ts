import { describe, expect, it, beforeEach } from 'vitest'
import { randomBytes } from 'node:crypto'
import { decryptCredentials, encryptCredentials } from './crypto'

const GOOD_KEY = randomBytes(32).toString('base64')

beforeEach(() => {
  delete process.env.PAYMENTS_ENCRYPTION_KEY
})

describe('crypto round trip', () => {
  it('encrypt -> decrypt returns the original plaintext', () => {
    process.env.PAYMENTS_ENCRYPTION_KEY = GOOD_KEY
    const secret = 'sk_live_super_secret_value'
    const ciphertext = encryptCredentials(secret)
    expect(ciphertext).not.toContain(secret)
    expect(decryptCredentials(ciphertext)).toBe(secret)
  })

  it('two encryptions of the same plaintext differ (random IV per call)', () => {
    process.env.PAYMENTS_ENCRYPTION_KEY = GOOD_KEY
    expect(encryptCredentials('same-value')).not.toBe(encryptCredentials('same-value'))
  })

  it('decrypting with the wrong key throws (auth tag check fails)', () => {
    process.env.PAYMENTS_ENCRYPTION_KEY = GOOD_KEY
    const ciphertext = encryptCredentials('sk_live_value')
    process.env.PAYMENTS_ENCRYPTION_KEY = randomBytes(32).toString('base64')
    expect(() => decryptCredentials(ciphertext)).toThrow()
  })

  it('encrypt throws when the key is missing — never silently stores plaintext', () => {
    expect(() => encryptCredentials('sk_live_value')).toThrow(/PAYMENTS_ENCRYPTION_KEY/)
  })

  it('decrypt throws when the key is missing', () => {
    expect(() => decryptCredentials('anything')).toThrow(/PAYMENTS_ENCRYPTION_KEY/)
  })

  it('throws when the key is the wrong length', () => {
    process.env.PAYMENTS_ENCRYPTION_KEY = Buffer.from('too-short').toString('base64')
    expect(() => encryptCredentials('x')).toThrow(/32 bytes/)
  })

  it('a single tampered ciphertext byte fails GCM authentication under the CORRECT key', () => {
    process.env.PAYMENTS_ENCRYPTION_KEY = GOOD_KEY
    const ciphertext = encryptCredentials('sk_live_super_secret_value')
    const raw = Buffer.from(ciphertext, 'base64')
    raw[raw.length - 1] ^= 0xff // flip the last byte of the ciphertext (after iv|tag)
    const tampered = raw.toString('base64')
    expect(() => decryptCredentials(tampered)).toThrow()
  })
})
