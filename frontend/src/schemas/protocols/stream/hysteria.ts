import { z } from 'zod';

export const HysteriaMasqueradeSchema = z.object({
  type: z.string().default(''),
  url: z.string().default(''),
  dir: z.string().default(''),
  content: z.string().default(''),
  headers: z.record(z.string()).default({}),
  rewriteHost: z.boolean().default(false),
  statusCode: z.number().int().optional(),
}).default({});

export const HysteriaStreamSettingsSchema = z.object({
  version: z.number().int().default(2),
  obfs: z.object({
    type: z.string().default('salamander'),
    salamander: z.object({ password: z.string().default('') }).default({}),
  }).optional(),
  udpIdleTimeout: z.number().int().default(0),
  masquerade: HysteriaMasqueradeSchema.optional(),
}).default({});

export type HysteriaStreamSettings = z.infer<typeof HysteriaStreamSettingsSchema>;
