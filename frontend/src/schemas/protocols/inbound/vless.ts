import { z } from 'zod';

const FallbackSchema = z.object({
  name: z.string().default(''),
  alpn: z.string().default(''),
  path: z.string().default(''),
  dest: z.string().default(''),
  xver: z.number().int().default(0),
});

export const VlessClientSchema = z.object({
  id: z.string().default(''),
  flow: z.string().default(''),
  email: z.string().default(''),
  limitIp: z.number().int().default(0),
  totalGB: z.number().int().default(0),
  expiryTime: z.number().int().default(0),
  enable: z.boolean().default(true),
  tgId: z.number().int().default(0),
  subId: z.string().default(''),
  comment: z.string().default(''),
  reset: z.number().int().default(0),
});

export const VlessInboundSettingsSchema = z.object({
  clients: z.array(VlessClientSchema).default([]),
  decryption: z.string().default('none'),
  encryption: z.string().default('none'),
  fallbacks: z.array(FallbackSchema).default([]),
  testseed: z.array(z.number()).optional(),
});

export type VlessClient = z.infer<typeof VlessClientSchema>;
export type VlessInboundSettings = z.infer<typeof VlessInboundSettingsSchema>;
