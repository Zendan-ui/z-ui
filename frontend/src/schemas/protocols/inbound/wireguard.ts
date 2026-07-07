import { z } from 'zod';

export const WireguardClientSchema = z.object({
  publicKey: z.string().default(''),
  preSharedKey: z.string().default(''),
  allowedIPs: z.array(z.string()).default(['10.0.0.2/32']),
  email: z.string().default(''),
  limitIp: z.number().int().default(0),
  totalGB: z.number().int().default(0),
  expiryTime: z.number().int().default(0),
  enable: z.boolean().default(true),
  tgId: z.number().int().default(0),
  subId: z.string().default(''),
  comment: z.string().default(''),
  reset: z.number().int().default(0),
  keepAlive: z.number().int().default(0),
});

export const WireguardPeerSchema = z.object({
  publicKey: z.string().default(''),
  preSharedKey: z.string().default(''),
  allowedIPs: z.array(z.string()).default([]),
  endpoint: z.string().default(''),
  keepAlive: z.number().int().default(0),
});

export const WireguardInboundSettingsSchema = z.object({
  secretKey: z.string().default(''),
  mtu: z.number().int().default(1420),
  dns: z.array(z.string()).default([]),
  noKernelTun: z.boolean().default(false),
  domainStrategy: z.string().default(''),
  clients: z.array(WireguardClientSchema).default([]),
  peers: z.array(WireguardPeerSchema).default([]),
  kernelMode: z.boolean().optional(),
});

export type WireguardClient = z.infer<typeof WireguardClientSchema>;
export type WireguardPeer = z.infer<typeof WireguardPeerSchema>;
export type WireguardInboundSettings = z.infer<typeof WireguardInboundSettingsSchema>;
