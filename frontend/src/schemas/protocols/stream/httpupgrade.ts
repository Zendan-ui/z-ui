import { z } from 'zod';

export const HttpUpgradeStreamSettingsSchema = z.object({
  acceptProxyProtocol: z.boolean().default(false),
  host: z.string().default(''),
  path: z.string().default('/'),
  headers: z.record(z.string()).default({}),
}).default({});

export type HttpUpgradeStreamSettings = z.infer<typeof HttpUpgradeStreamSettingsSchema>;
