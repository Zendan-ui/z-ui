import { z } from 'zod';

export const TunInboundSettingsSchema = z.object({
  name: z.string().default('xray0'),
  mtu: z.number().int().default(1500),
  gateway: z.array(z.string()).default([]),
  dns: z.array(z.string()).default([]),
  userLevel: z.number().int().default(0),
  autoSystemRoutingTable: z.array(z.string()).default([]),
  autoOutboundsInterface: z.string().default('auto'),
});

export type TunInboundSettings = z.infer<typeof TunInboundSettingsSchema>;
