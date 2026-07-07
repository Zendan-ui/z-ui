import { z } from 'zod';
const HttpServerSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(8080),
  users: z.array(z.object({ user: z.string(), pass: z.string() })).default([]),
});
export const HttpOutboundSettingsSchema = z.object({
  servers: z.array(HttpServerSchema).default([]),
}).default({});
export type HttpOutboundSettings = z.infer<typeof HttpOutboundSettingsSchema>;
