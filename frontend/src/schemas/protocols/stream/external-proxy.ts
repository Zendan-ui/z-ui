import { z } from 'zod';

export const ExternalProxyEntrySchema = z.object({
  forceTLS: z.boolean().default(false),
  dest: z.string().default(''),
  port: z.number().int().min(1).max(65535).default(443),
  remark: z.string().default(''),
});

export type ExternalProxyEntry = z.infer<typeof ExternalProxyEntrySchema>;
