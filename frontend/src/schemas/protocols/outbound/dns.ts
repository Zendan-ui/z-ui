import { z } from 'zod';
export const DnsOutboundSettingsSchema = z.object({
  rewriteNetwork: z.string().default(''),
  rewriteAddress: z.string().default(''),
  rewritePort: z.number().int().default(53),
  userLevel: z.number().int().default(0),
  rules: z.array(z.unknown()).default([]),
}).default({});
export type DNSOutboundSettings = z.infer<typeof DnsOutboundSettingsSchema>;
