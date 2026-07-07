import { z } from 'zod';
import {
  ClientSchema,
  ClientRecordSchema,
  InboundOptionSchema,
} from '@/generated/zod';

export { ClientSchema, ClientRecordSchema };
export type { Client } from '@/generated/zod';
export type { ClientRecord } from '@/generated/zod';

export { InboundOptionSchema };
export type { InboundOption } from '@/generated/zod';

export const InboundOptionsSchema = z.array(InboundOptionSchema);
export type InboundOptions = z.infer<typeof InboundOptionsSchema>;

export const ClientFormSchema = z.object({
  email: z.string().min(1),
  enable: z.boolean().default(true),
  limitIp: z.number().int().min(0).default(0),
  totalGB: z.number().min(0).default(0),
  expiryTime: z.number().int().default(0),
  tgId: z.number().int().default(0),
  subId: z.string().default(''),
  comment: z.string().default(''),
  reset: z.number().int().default(0),
  security: z.string().default(''),
  flow: z.string().default(''),
  password: z.string().optional(),
  id: z.string().optional(),
  publicKey: z.string().optional(),
  privateKey: z.string().optional(),
  preSharedKey: z.string().optional(),
  allowedIPs: z.array(z.string()).optional(),
  keepAlive: z.number().int().optional(),
  auth: z.string().optional(),
  secret: z.string().optional(),
}).passthrough();

export type ClientFormValues = z.infer<typeof ClientFormSchema>;

export const ClientCreateFormSchema = ClientFormSchema.extend({
  inboundIds: z.array(z.number().int()).default([]),
});

export type ClientCreateFormValues = z.infer<typeof ClientCreateFormSchema>;

export const ClientBulkAddFormSchema = z.object({
  count: z.number().int().min(1).default(1),
  prefix: z.string().default(''),
  limitIp: z.number().int().min(0).default(0),
  totalGB: z.number().min(0).default(0),
  expiryTime: z.number().int().default(0),
  tgId: z.number().int().default(0),
  reset: z.number().int().default(0),
  inboundIds: z.array(z.number().int()).default([]),
});

export type ClientBulkAddFormValues = z.infer<typeof ClientBulkAddFormSchema>;

export const ClientBulkAdjustFormSchema = z.object({
  limitIp: z.number().int().min(0).optional(),
  totalGB: z.number().min(0).optional(),
  expiryTime: z.number().int().optional(),
  tgId: z.number().int().optional(),
  reset: z.number().int().optional(),
  enable: z.boolean().optional(),
  addTotalGB: z.number().optional(),
  addExpiryTime: z.number().int().optional(),
});

export type ClientBulkAdjustFormValues = z.infer<typeof ClientBulkAdjustFormSchema>;

export const OnlineByNodeSchema = z.record(z.array(z.string()));
export const OnlinesSchema = z.record(z.array(z.string()));
export const ActiveInboundsByNodeSchema = z.record(z.array(z.number().int()));

export type OnlineByNode = z.infer<typeof OnlineByNodeSchema>;
export type Onlines = z.infer<typeof OnlinesSchema>;
export type ActiveInboundsByNode = z.infer<typeof ActiveInboundsByNodeSchema>;

export const BulkAttachResultSchema = z.object({
  attached: z.number().int(),
  skipped: z.number().int(),
  errors: z.array(z.string()).optional(),
});

export const BulkDetachResultSchema = z.object({
  detached: z.number().int(),
  errors: z.array(z.string()).optional(),
});

export type BulkAttachResult = z.infer<typeof BulkAttachResultSchema>;
export type BulkDetachResult = z.infer<typeof BulkDetachResultSchema>;
