import { z } from 'zod';

export const MixedInboundSettingsSchema = z.object({
  auth: z.string().default('password'),
  accounts: z.array(z.object({ user: z.string().default(''), pass: z.string().default('') })).default([]),
  udp: z.boolean().default(false),
  ip: z.string().default('127.0.0.1'),
  userLevel: z.number().int().optional(),
});

export type MixedInboundSettings = z.infer<typeof MixedInboundSettingsSchema>;
