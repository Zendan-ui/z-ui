import { z } from 'zod';

export const DefaultsPayloadSchema = z.object({
  inbound: z.unknown().optional(),
  outbound: z.unknown().optional(),
  inboundStream: z.unknown().optional(),
  outboundStream: z.unknown().optional(),
}).passthrough();

export type DefaultsPayload = z.infer<typeof DefaultsPayloadSchema>;
