import { z } from 'zod';

export const HttpAccountSchema = z.object({
  user: z.string().default(''),
  pass: z.string().default(''),
});

export const HttpInboundSettingsSchema = z.object({
  accounts: z.array(HttpAccountSchema).default([]),
  allowTransparent: z.boolean().default(false),
});

export type HttpInboundSettings = z.infer<typeof HttpInboundSettingsSchema>;
