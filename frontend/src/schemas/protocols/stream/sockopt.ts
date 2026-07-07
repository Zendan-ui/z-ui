import { z } from 'zod';

export const SockoptStreamSettingsSchema = z.object({
  mark: z.number().int().default(0),
  tcpMaxSeg: z.number().int().optional(),
  tcpFastOpen: z.boolean().optional(),
  tproxy: z.enum(['redirect', 'tproxy', 'off']).optional(),
  domainStrategy: z.string().default(''),
  dialerProxy: z.string().optional(),
  acceptProxyProtocol: z.boolean().optional(),
  tcpKeepAliveIdle: z.number().int().optional(),
  tcpKeepAliveInterval: z.number().int().optional(),
  tcpNoDelay: z.boolean().optional(),
  tcpcongestion: z.string().optional(),
  tcpUserTimeout: z.number().int().optional(),
  interface: z.string().optional(),
  v6only: z.boolean().optional(),
  bindToDevice: z.string().optional(),
  customSockopt: z.array(z.unknown()).default([]),
}).default({});

export type SockoptStreamSettings = z.infer<typeof SockoptStreamSettingsSchema>;
