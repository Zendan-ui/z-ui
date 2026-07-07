import { z } from 'zod';

export const TlsCertificateSchema = z.object({
  useFile: z.boolean().default(true),
  certificateFile: z.string().default(''),
  keyFile: z.string().default(''),
  certificate: z.array(z.string()).default([]),
  key: z.array(z.string()).default([]),
  ocspStapling: z.number().int().default(0),
  oneTimeLoading: z.boolean().default(false),
  usage: z.string().default('encipherment'),
  buildChain: z.boolean().default(false),
}).default({});

export const TlsSettingsInnerSchema = z.object({
  fingerprint: z.string().default(''),
  echConfigList: z.string().default(''),
  pinnedPeerCertSha256: z.array(z.string()).default([]),
  allowInsecure: z.boolean().default(false),
}).default({});

export const TlsStreamSettingsSchema = z.object({
  serverName: z.string().default(''),
  rejectUnknownSni: z.boolean().default(false),
  allowInsecure: z.boolean().default(false),
  alpn: z.array(z.string()).default([]),
  minVersion: z.string().default(''),
  maxVersion: z.string().default(''),
  cipherSuites: z.string().default(''),
  curvePreferences: z.array(z.string()).default([]),
  pinnedPeerCertificateChainSha256: z.array(z.string()).default([]),
  certificates: z.array(TlsCertificateSchema).default([]),
  verifyClientCertificate: z.boolean().default(false),
  fingerprint: z.string().default(''),
  masterKeyLog: z.string().default(''),
  disableSystemRoot: z.boolean().default(false),
  enableSessionResumption: z.boolean().default(false),
  settings: TlsSettingsInnerSchema.optional(),
}).default({});

export type TlsStreamSettings = z.infer<typeof TlsStreamSettingsSchema>;
export type TlsCertificate = z.infer<typeof TlsCertificateSchema>;
