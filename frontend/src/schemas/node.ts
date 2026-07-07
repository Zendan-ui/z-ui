import { z } from 'zod';
import { NodeSchema } from '@/generated/zod';

export { NodeSchema };
export type NodeRecord = z.infer<typeof NodeSchema>;

export const NodeListSchema = z.array(NodeSchema);
export type NodeList = z.infer<typeof NodeListSchema>;

export const NodeFormSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  apiToken: z.string().min(1),
  scheme: z.enum(['http', 'https']).default('https'),
  enable: z.boolean().default(true),
  remark: z.string().default(''),
  outboundTag: z.string().default(''),
  inboundSyncMode: z.enum(['all', 'selected']).default('all'),
  inboundTags: z.array(z.string()).default([]),
  tlsVerifyMode: z.enum(['verify', 'skip', 'pin', 'mtls']).default('verify'),
  pinnedCertSha256: z.string().default(''),
  allowPrivateAddress: z.boolean().default(false),
  transitive: z.boolean().optional(),
});

export type NodeFormValues = z.infer<typeof NodeFormSchema>;

export const ProbeResultSchema = z.object({
  ok: z.boolean(),
  latencyMs: z.number().int().optional(),
  error: z.string().optional(),
  version: z.string().optional(),
});

export type ProbeResult = z.infer<typeof ProbeResultSchema>;
