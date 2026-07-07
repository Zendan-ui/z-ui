import { z } from 'zod';

export const XHttpXmuxSchema = z.object({
  maxConcurrency: z.union([z.number(), z.string()]).default(0),
  maxConnections: z.union([z.number(), z.string()]).default(0),
  cMaxReuseTimes: z.union([z.number(), z.string()]).default(0),
  cMaxLifetimeMs: z.union([z.number(), z.string()]).default(0),
  hMaxRequestTimes: z.union([z.number(), z.string()]).default(0),
  hMaxReusableSecs: z.union([z.number(), z.string()]).default(0),
  hKeepAlivePeriod: z.union([z.number(), z.string()]).default(0),
}).default({});

export const XHTTP_SESSION_ID_TABLES = {
  'none': 'none',
  'base64': 'base64',
  'hex': 'hex',
} as const;

export const XHttpStreamSettingsSchema = z.object({
  mode: z.enum(['auto', 'packet-up', 'stream-up', 'stream-one']).default('auto'),
  host: z.string().default(''),
  path: z.string().default('/'),
  headers: z.record(z.string()).default({}),
  scMaxEachPostBytes: z.union([z.number(), z.string()]).default(''),
  scMaxBufferedPosts: z.union([z.number(), z.string()]).default(0),
  scMinPostsIntervalMs: z.union([z.number(), z.string()]).default(''),
  scStreamUpServerSecs: z.union([z.number(), z.string()]).default(''),
  serverMaxHeaderBytes: z.number().int().min(0).optional(),
  xPaddingBytes: z.union([z.number(), z.string()]).default(''),
  xPaddingObfsMode: z.boolean().default(false),
  noSSEHeader: z.boolean().default(false),
  uplinkHTTPMethod: z.string().default(''),
  downloadSettings: z.unknown().optional(),
  xmux: XHttpXmuxSchema.optional(),
  sessionIDPlacement: z.string().optional(),
  sessionIDTable: z.string().optional(),
  seqPlacement: z.string().optional(),
  uplinkDataPlacement: z.string().optional(),
}).default({});

export type XHttpStreamSettings = z.infer<typeof XHttpStreamSettingsSchema>;
export type XHttpXmux = z.infer<typeof XHttpXmuxSchema>;
