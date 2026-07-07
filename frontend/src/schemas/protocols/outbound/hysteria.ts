import { z } from 'zod';
export const HysteriaOutboundSettingsSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(443),
  version: z.number().int().default(2),
  auth: z.string().optional(),
  obfs: z.string().optional(),
  obfsPassword: z.string().optional(),
  hopInterval: z.string().optional(),
}).default({});
export type HysteriaOutboundSettings = z.infer<typeof HysteriaOutboundSettingsSchema>;
