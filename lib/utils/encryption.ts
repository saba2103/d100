import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Fallback key of exactly 32 characters for development purposes.
const DEFAULT_KEY = "d100_super_secret_dev_key_32_chars";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || DEFAULT_KEY;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  // Ensure encryption key is sliced/padded to exactly 32 bytes
  const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(32, "x").slice(0, 32));
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const textParts = text.split(":");
  if (textParts.length < 2) {
    throw new Error("Invalid encrypted text format.");
  }
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  
  const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(32, "x").slice(0, 32));
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString("utf8");
}

export function decryptSafe(text: string | null | undefined): string | null {
  if (!text) return null;
  try {
    return decrypt(text);
  } catch {
    // Return text as-is if it is not formatted as cipher:iv (e.g. raw pasted keys in dev)
    return text;
  }
}
