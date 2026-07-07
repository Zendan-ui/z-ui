import { z } from 'zod';

export const WsStreamSettingsSchema = z.object({
  acceptProxyProtocol: z.boolean().default(false),
  host: z.string().default(''),
  path: z.string().default('/'),
  headers: z.record(z.string()).default({}),
  heartbeatPeriod: z.number().int().min(0).default(0),
}).default({});

export type WsStreamSettings = z.infer<typeof WsStreamSettingsSchema>;
