import { z } from 'zod';
const SsServerSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(443),
  method: z.string().default('2022-blake3-aes-128-gcm'),
  password: z.string().default(''),
  email: z.string().optional(),
  level: z.number().int().optional(),
  ivCheck: z.boolean().optional(),
});
export const ShadowsocksOutboundSettingsSchema = z.object({
  servers: z.array(SsServerSchema).default([]),
}).default({});
export type ShadowsocksOutboundSettings = z.infer<typeof ShadowsocksOutboundSettingsSchema>;
