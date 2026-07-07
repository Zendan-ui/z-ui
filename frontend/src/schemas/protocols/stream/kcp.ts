import { z } from 'zod';

export const KcpStreamSettingsSchema = z.object({
  mtu: z.number().int().min(576).max(1460).default(1350),
  tti: z.number().int().min(10).max(100).default(20),
  uplinkCapacity: z.number().int().min(0).default(5),
  downlinkCapacity: z.number().int().min(0).default(20),
  congestion: z.boolean().default(false),
  readBufferSize: z.number().int().min(0).default(2),
  writeBufferSize: z.number().int().min(0).default(2),
  cwndMultiplier: z.number().int().min(1).default(1),
  maxSendingWindow: z.number().int().min(0).default(0),
  header: z.object({ type: z.string().default('none') }).default({}),
  seed: z.string().optional(),
}).default({});

export type KcpStreamSettings = z.infer<typeof KcpStreamSettingsSchema>;
