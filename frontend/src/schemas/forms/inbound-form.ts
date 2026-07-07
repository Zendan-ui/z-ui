import { z } from 'zod';

export const TRAFFIC_RESETS = ['never', 'hourly', 'daily', 'weekly', 'monthly'] as const;
export type TrafficReset = typeof TRAFFIC_RESETS[number];

export const SHARE_ADDR_STRATEGIES = ['node', 'listen', 'custom'] as const;
export type ShareAddrStrategy = typeof SHARE_ADDR_STRATEGIES[number];

export const FallbackRowSchema = z.object({
  name: z.string().default(''),
  alpn: z.string().default(''),
  path: z.string().default(''),
  dest: z.string().default(''),
  xver: z.number().int().default(0),
});
export type FallbackRow = z.infer<typeof FallbackRowSchema>;

export const InboundFormSchema = z.object({
  id: z.number().int().optional(),
  tag: z.string().default(''),
  enable: z.boolean().default(true),
  remark: z.string().default(''),
  listen: z.string().default(''),
  port: z.number().int().min(0).max(65535).default(443),
  protocol: z.string().default('vless'),
  settings: z.unknown(),
  streamSettings: z.unknown(),
  sniffing: z.unknown(),
  up: z.number().int().default(0),
  down: z.number().int().default(0),
  total: z.number().int().default(0),
  expiryTime: z.number().int().default(0),
  trafficReset: z.enum(TRAFFIC_RESETS).default('never'),
  lastTrafficResetTime: z.number().int().default(0),
  nodeId: z.number().int().nullable().optional(),
  shareAddrStrategy: z.enum(SHARE_ADDR_STRATEGIES).default('node'),
  shareAddr: z.string().default(''),
  subSortIndex: z.number().int().default(1),
  clientStats: z.unknown(),
}).passthrough();

export type InboundFormValues = z.infer<typeof InboundFormSchema>;
