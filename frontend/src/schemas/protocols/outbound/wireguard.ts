import { z } from 'zod';
const WgPeerSchema = z.object({
  publicKey: z.string().default(''),
  preSharedKey: z.string().optional(),
  allowedIPs: z.array(z.string()).default([]),
  endpoint: z.string().default(''),
  keepAlive: z.number().int().optional(),
});
export const WireguardOutboundSettingsSchema = z.object({
  secretKey: z.string().default(''),
  mtu: z.number().int().default(1420),
  address: z.array(z.string()).default([]),
  peers: z.array(WgPeerSchema).default([]),
  noKernelTun: z.boolean().default(false),
  domainStrategy: z.string().optional(),
  dns: z.array(z.string()).optional(),
}).default({});
export type WireguardOutboundSettings = z.infer<typeof WireguardOutboundSettingsSchema>;
