import { z } from 'zod';

export const VmessClientSchema = z.object({
  id: z.string().default(''),
  security: z.string().default('auto'),
  alterId: z.number().int().default(0),
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

export const VmessInboundSettingsSchema = z.object({
  clients: z.array(VmessClientSchema).default([]),
});

export type VmessClient = z.infer<typeof VmessClientSchema>;
export type VmessInboundSettings = z.infer<typeof VmessInboundSettingsSchema>;
