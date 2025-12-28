import * as crypto from 'crypto';
import * as zlib from 'zlib';

/**
 * Compression and Encryption Utility
 * Uses AES-256-GCM encryption with gzip compression
 */
export class CompressionEncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits
  private static readonly AAD = 'HR-System-Additional-Data'; // Additional authenticated data

  /**
   * Get the encryption key from environment variable
   * Falls back to a default key if not set (for development only)
   */
  private static getSecretKey(): string {
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!!';
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return key.substring(0, 32); // Ensure exactly 32 bytes for AES-256
  }

  /**
   * Encrypt and compress data
   * @param data - Plain text data to encrypt
   * @returns Base64 encoded encrypted and compressed data
   */
  static encryptAndCompress(data: string): string {
    try {
      // Compress the data first
      const compressed = zlib.gzipSync(Buffer.from(data, 'utf8'));

      // Generate random IV
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.ALGORITHM,
        Buffer.from(this.getSecretKey(), 'utf8'),
        iv
      );

      // Set additional authenticated data
      cipher.setAAD(Buffer.from(this.AAD, 'utf8'));

      // Encrypt
      const encrypted = Buffer.concat([
        cipher.update(compressed),
        cipher.final(),
      ]);

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine IV, tag, and encrypted data
      const combined = Buffer.concat([iv, tag, encrypted]);

      // Return as base64
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypt and decompress data
   * @param encryptedData - Base64 encoded encrypted data
   * @returns Decrypted and decompressed plain text
   */
  static decryptAndDecompress(encryptedData: string): string {
    try {
      // Normalize base64 string
      let normalized = encryptedData.trim().replace(/\s/g, '');
      const paddingNeeded = (4 - (normalized.length % 4)) % 4;
      if (paddingNeeded > 0 && !normalized.endsWith('=')) {
        normalized += '='.repeat(paddingNeeded);
      }

      // Decode from base64
      const combined = Buffer.from(normalized, 'base64');

      // Extract components
      const iv = combined.subarray(0, this.IV_LENGTH);
      const tag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
      const encrypted = combined.subarray(this.IV_LENGTH + this.TAG_LENGTH);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.ALGORITHM,
        Buffer.from(this.getSecretKey(), 'utf8'),
        iv
      );

      // Set additional authenticated data
      decipher.setAAD(Buffer.from(this.AAD, 'utf8'));

      // Set authentication tag
      decipher.setAuthTag(tag);

      // Decrypt
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      // Decompress and return
      const decompressed = zlib.gunzipSync(decrypted);
      return decompressed.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

