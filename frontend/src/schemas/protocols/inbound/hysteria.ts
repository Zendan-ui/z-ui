import { z } from 'zod';

export const HysteriaClientSchema = z.object({
  auth: z.string().default(''),
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

export const HysteriaInboundSettingsSchema = z.object({
  version: z.number().int().default(2),
  clients: z.array(HysteriaClientSchema).default([]),
});

export type HysteriaClient = z.infer<typeof HysteriaClientSchema>;
export type HysteriaInboundSettings = z.infer<typeof HysteriaInboundSettingsSchema>;
