import { z } from 'zod';
const SocksServerSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(1080),
  users: z.array(z.object({ user: z.string(), pass: z.string() })).default([]),
});
export const SocksOutboundSettingsSchema = z.object({
  servers: z.array(SocksServerSchema).default([]),
}).default({});
export type SocksOutboundSettings = z.infer<typeof SocksOutboundSettingsSchema>;
