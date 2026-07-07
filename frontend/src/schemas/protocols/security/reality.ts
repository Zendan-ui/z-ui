import { z } from 'zod';

export const RealitySettingsInnerSchema = z.object({
  fingerprint: z.string().default('chrome'),
  publicKey: z.string().default(''),
  spiderX: z.string().default('/'),
  serverName: z.string().default(''),
}).default({});

export const RealityStreamSettingsSchema = z.object({
  show: z.boolean().default(false),
  xver: z.number().int().default(0),
  dest: z.string().optional(),
  target: z.string().default(''),
  serverNames: z.array(z.string()).default([]),
  privateKey: z.string().default(''),
  minClientVer: z.string().default(''),
  maxClientVer: z.string().default(''),
  maxTimeDiff: z.number().int().default(0),
  shortIds: z.array(z.string()).default([]),
  settings: RealitySettingsInnerSchema.optional(),
  mldsa65PrivateKey: z.string().optional(),
  mldsa65PublicKey: z.string().optional(),
}).default({});

export type RealityStreamSettings = z.infer<typeof RealityStreamSettingsSchema>;
