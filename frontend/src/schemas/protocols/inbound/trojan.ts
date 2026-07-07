import { z } from 'zod';

const FallbackSchema = z.object({
  name: z.string().default(''),
  alpn: z.string().default(''),
  path: z.string().default(''),
  dest: z.string().default(''),
  xver: z.number().int().default(0),
});

export const TrojanClientSchema = z.object({
  password: z.string().default(''),
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

export const TrojanInboundSettingsSchema = z.object({
  clients: z.array(TrojanClientSchema).default([]),
  fallbacks: z.array(FallbackSchema).default([]),
});

export type TrojanClient = z.infer<typeof TrojanClientSchema>;
export type TrojanInboundSettings = z.infer<typeof TrojanInboundSettingsSchema>;
