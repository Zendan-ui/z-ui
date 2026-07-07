import { z } from 'zod';
const VmessUserSchema = z.object({
  id: z.string().default(''),
  security: z.string().default('auto'),
  alterId: z.number().int().optional(),
  level: z.number().int().optional(),
  experiments: z.string().optional(),
});
const VmessServerSchema = z.object({
  address: z.string().default(''),
  port: z.number().int().default(443),
  users: z.array(VmessUserSchema).default([]),
});
export const VmessOutboundSettingsSchema = z.object({
  vnext: z.array(VmessServerSchema).default([]),
}).default({});
export type VmessOutboundSettings = z.infer<typeof VmessOutboundSettingsSchema>;
