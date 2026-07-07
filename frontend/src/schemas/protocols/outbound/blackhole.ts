import { z } from 'zod';
export const BlackholeOutboundSettingsSchema = z.object({
  response: z.object({ type: z.string().default('none') }).optional(),
}).default({});
export type BlackholeOutboundSettings = z.infer<typeof BlackholeOutboundSettingsSchema>;
