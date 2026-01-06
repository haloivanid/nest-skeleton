import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

@Injectable()
export class CryptService {
  private readonly MASTER_KEY: Buffer = Buffer.from(process.env.MASTER_KEY, 'hex');
  private readonly DERIVE_KEY: Buffer = Buffer.from(process.env.DERIVE_KEY, 'hex');
  private readonly SALT_ROUND: number = +(process.env.SALT_ROUND || 10);
  private readonly PII_SECRET: Buffer = Buffer.from(process.env.PII_SECRET, 'hex');
  private readonly PII_ACTIVE: number = +(process.env.PII_ACTIVE || 2);
  private readonly HMAC_SECRET: Buffer = Buffer.from(process.env.HMAC_SECRET, 'hex');

  private readonly IV_LEN = 12;
  private readonly IV_TAG_LEN = 16;
  private readonly IV_ALG = 'aes-256-gcm';
  private readonly MAX_INPUT_LENGTH = 10000;

  private readonly keyCache = new Map<string, Buffer>();

  constructor() {
    this.validation();
  }

  async toHash(password: string) {
    return bcrypt.hash(password, this.SALT_ROUND);
  }

  async compareHash(password: string, salted: string): Promise<boolean> {
    return bcrypt.compare(password, salted);
  }

  toIndexableData(value: string) {
    if (value.length > this.MAX_INPUT_LENGTH) {
      throw new Error('Input exceeds maximum allowed length');
    }

    value = value.trim().toLowerCase();

    return createHmac('sha256', this.getHmacKey()).update(value).digest('hex');
  }

  toCipherData(value: string) {
    if (value.length > this.MAX_INPUT_LENGTH) {
      throw new Error('Input exceeds maximum allowed length');
    }

    value = value.trim().toLowerCase();

    const iv = randomBytes(this.IV_LEN);
    const cipher = createCipheriv(this.IV_ALG, this.getPiiKey(), iv, { authTagLength: this.IV_TAG_LEN });
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const level = Buffer.from([+this.PII_ACTIVE & 0xff]);

    return Buffer.concat([level, iv, tag, encrypted]).toString('base64');
  }

  fromCipherData(cipher: string) {
    const minLength = 1 + this.IV_LEN + this.IV_TAG_LEN;
    const cipherBuffer = Buffer.from(cipher, 'base64');
    if (cipherBuffer.length < minLength) {
      throw new Error('Invalid cipher data');
    }

    try {
      const level = cipherBuffer.readUint8(0);
      const iv = cipherBuffer.subarray(1, 1 + this.IV_LEN);
      const tag = cipherBuffer.subarray(1 + this.IV_LEN, 1 + this.IV_LEN + this.IV_TAG_LEN);
      const encrypted = cipherBuffer.subarray(1 + this.IV_LEN + this.IV_TAG_LEN);

      const key = this.getPiiKey(level);
      const decipher = createDecipheriv(this.IV_ALG, key, iv, { authTagLength: this.IV_TAG_LEN });
      decipher.setAuthTag(tag);

      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch (_error) {
      throw new Error('Failed to decrypt data');
    }
  }

  private derive32(value: Buffer) {
    const derived = hkdfSync('sha256', this.MASTER_KEY, this.DERIVE_KEY, value, 32);
    return Buffer.from(derived);
  }

  private getPiiKey(version = this.PII_ACTIVE) {
    const cacheKey = `pii_${version}`;

    if (!this.keyCache.has(cacheKey)) {
      const key = this.derive32(Buffer.concat([this.PII_SECRET, Buffer.from(version.toString(), 'utf8')]));
      this.keyCache.set(cacheKey, key);
    }

    return this.keyCache.get(cacheKey)!;
  }

  private getHmacKey() {
    const cacheKey = 'hmac';

    if (!this.keyCache.has(cacheKey)) {
      const key = this.derive32(this.HMAC_SECRET);
      this.keyCache.set(cacheKey, key);
    }

    return this.keyCache.get(cacheKey)!;
  }

  private validation() {
    if (!Number.isInteger(this.SALT_ROUND) || this.SALT_ROUND < 10) {
      throw new Error('SALT_ROUND must be an integer >= 10');
    }

    if (!Number.isInteger(Number(this.PII_ACTIVE)) || +this.PII_ACTIVE < 1 || +this.PII_ACTIVE > 255) {
      throw new Error('PII_ACTIVE must be an integer between 1 and 255');
    }

    if (this.MASTER_KEY.length < 16) {
      throw new Error('MASTER_KEY must be at least 16 bytes (32 hex characters)');
    }

    if (!this.DERIVE_KEY || this.DERIVE_KEY.length === 0) {
      throw new Error('DERIVE_KEY is required');
    }

    if (!this.PII_SECRET || this.PII_SECRET.length < 8) {
      throw new Error('PII_SECRET must be at least 8 bytes (16 hex characters)');
    }

    if (!this.HMAC_SECRET || this.HMAC_SECRET.length < 8) {
      throw new Error('HMAC_SECRET must be at least 8 bytes (16 hex characters)');
    }

    this.validateHexBuffer(this.MASTER_KEY, 'MASTER_KEY');
    this.validateHexBuffer(this.DERIVE_KEY, 'DERIVE_KEY');
    this.validateHexBuffer(this.PII_SECRET, 'PII_SECRET');
    this.validateHexBuffer(this.HMAC_SECRET, 'HMAC_SECRET');
  }

  private validateHexBuffer(buffer: Buffer, name: string) {
    if (buffer.length === 0 || buffer.every((byte) => byte === 0)) {
      throw new Error(`${name} appears to be invalid hex`);
    }
  }
}
