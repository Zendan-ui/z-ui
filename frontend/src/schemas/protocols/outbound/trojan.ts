import { z } from 'zod';
const TrojanServerSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(443),
  password: z.string().default(''),
  email: z.string().optional(),
  level: z.number().int().optional(),
});
export const TrojanOutboundSettingsSchema = z.object({
  servers: z.array(TrojanServerSchema).default([]),
}).default({});
export type TrojanOutboundSettings = z.infer<typeof TrojanOutboundSettingsSchema>;
