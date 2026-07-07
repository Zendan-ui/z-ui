import { z } from 'zod';

export const MtprotoClientSchema = z.object({
  secret: z.string().default(''),
  email: z.string().default(''),
  limitIp: z.number().int().default(0),
  totalGB: z.number().int().default(0),
  expiryTime: z.number().int().default(0),
  enable: z.boolean().default(true),
  tgId: z.number().int().default(0),
  subId: z.string().default(''),
  comment: z.string().default(''),
  reset: z.number().int().default(0),
});

export const MtprotoInboundSettingsSchema = z.object({
  fakeTlsDomain: z.string().default('www.cloudflare.com'),
  clients: z.array(MtprotoClientSchema).default([]),
  routeThroughXray: z.boolean().default(false),
  adTag: z.string().default(''),
  publicIpv4: z.string().default(''),
  publicIpv6: z.string().default(''),
});

export type MtprotoClient = z.infer<typeof MtprotoClientSchema>;
export type MtprotoInboundSettings = z.infer<typeof MtprotoInboundSettingsSchema>;
