import { z } from 'zod';

export const ShadowsocksClientSchema = z.object({
  method: z.string().default(''),
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

export const ShadowsocksInboundSettingsSchema = z.object({
  method: z.string().default('2022-blake3-aes-256-gcm'),
  password: z.string().default(''),
  network: z.string().default('tcp,udp'),
  clients: z.array(ShadowsocksClientSchema).default([]),
  ivCheck: z.boolean().default(false),
});

export type ShadowsocksClient = z.infer<typeof ShadowsocksClientSchema>;
export type ShadowsocksInboundSettings = z.infer<typeof ShadowsocksInboundSettingsSchema>;
