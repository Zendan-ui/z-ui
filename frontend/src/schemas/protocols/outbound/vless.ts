import { z } from 'zod';
export const VlessOutboundSettingsSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(443),
  id: z.string().default(''),
  flow: z.string().default(''),
  encryption: z.string().default('none'),
  network: z.string().optional(),
}).default({});
export type VlessOutboundSettings = z.infer<typeof VlessOutboundSettingsSchema>;
