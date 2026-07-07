import { z } from 'zod';

export const SS_METHODS = [
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
  'aes-128-gcm',
  'aes-256-gcm',
  'chacha20-poly1305',
  'xchacha20-poly1305',
  'none',
] as const;

export const SSMethodSchema = z.enum(SS_METHODS);
export type SSMethod = z.infer<typeof SSMethodSchema>;
