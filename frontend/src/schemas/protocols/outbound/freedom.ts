import { z } from 'zod';
export const FreedomOutboundSettingsSchema = z.object({
  domainStrategy: z.string().optional(),
  redirect: z.string().optional(),
  userLevel: z.number().int().optional(),
  fragment: z.unknown().optional(),
  noise: z.unknown().optional(),
  finalRule: z.unknown().optional(),
}).default({});
export type FreedomOutboundSettings = z.infer<typeof FreedomOutboundSettingsSchema>;
