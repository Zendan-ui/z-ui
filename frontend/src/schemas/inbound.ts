import { z } from 'zod';
import { InboundSchema, ClientTrafficSchema } from '@/generated/zod';

export { InboundSchema };
export type { Inbound } from '@/generated/zod';

export const SlimInboundSchema = InboundSchema.pick({
  id: true,
  remark: true,
  protocol: true,
  port: true,
  enable: true,
  tag: true,
  up: true,
  down: true,
  total: true,
  expiryTime: true,
}).extend({
  nodeId: z.number().int().nullable().optional(),
  clientStats: z.array(ClientTrafficSchema).optional(),
});

export const SlimInboundListSchema = z.array(SlimInboundSchema);
export type SlimInbound = z.infer<typeof SlimInboundSchema>;

export const LastOnlineMapSchema = z.record(z.number().int());
export type LastOnlineMap = z.infer<typeof LastOnlineMapSchema>;

export const InboundDetailSchema = InboundSchema.extend({
  settings: z.unknown(),
  streamSettings: z.unknown(),
  sniffing: z.unknown(),
});

export type InboundDetail = z.infer<typeof InboundDetailSchema>;
