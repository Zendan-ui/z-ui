import { z } from 'zod';
export const LoopbackOutboundSettingsSchema = z.object({
  inboundTag: z.string().default(''),
}).default({});
export type LoopbackOutboundSettings = z.infer<typeof LoopbackOutboundSettingsSchema>;
