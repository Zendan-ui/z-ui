import { z } from 'zod';
import { OutboundTrafficsSchema } from '@/generated/zod';

export const OutboundTrafficRowSchema = OutboundTrafficsSchema.extend({
  tag: z.string().optional(),
});
export type OutboundTrafficRow = z.infer<typeof OutboundTrafficRowSchema>;

export const OutboundTrafficListSchema = z.array(OutboundTrafficRowSchema);

export const OutboundTestResultSchema = z.object({
  tag: z.string(),
  ok: z.boolean(),
  latencyMs: z.number().int().optional(),
  error: z.string().optional(),
  ip: z.string().optional(),
});
export type OutboundTestResult = z.infer<typeof OutboundTestResultSchema>;

export const OutboundTestResultListSchema = z.array(OutboundTestResultSchema);

export const XrayConfigPayloadSchema = z.object({
  inbounds: z.array(z.unknown()).optional(),
  outbounds: z.array(z.unknown()).optional(),
  routing: z.unknown().optional(),
  dns: z.unknown().optional(),
  log: z.unknown().optional(),
  stats: z.unknown().optional(),
  api: z.unknown().optional(),
  policy: z.unknown().optional(),
  reverse: z.unknown().optional(),
  fakedns: z.array(z.unknown()).optional(),
  observatory: z.unknown().optional(),
  burstObservatory: z.unknown().optional(),
  metrics: z.unknown().optional(),
}).passthrough();

export type XrayConfigPayload = z.infer<typeof XrayConfigPayloadSchema>;

export const XraySettingsValueSchema = z.record(z.unknown()).or(z.unknown());
export type XraySettingsValue = z.infer<typeof XraySettingsValueSchema>;
