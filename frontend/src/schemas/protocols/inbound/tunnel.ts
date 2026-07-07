import { z } from 'zod';

export const TunnelInboundSettingsSchema = z.object({
  portMap: z.record(z.string()).default({}),
  allowedNetwork: z.string().default('tcp,udp'),
  followRedirect: z.boolean().default(false),
  rewriteAddress: z.string().optional(),
  rewritePort: z.number().int().optional(),
});

export type TunnelInboundSettings = z.infer<typeof TunnelInboundSettingsSchema>;
