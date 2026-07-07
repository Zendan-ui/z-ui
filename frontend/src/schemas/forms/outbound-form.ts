import { z } from 'zod';
import type { Sniffing } from '@/schemas/primitives';

export interface VmessOutboundFormSettings {
  address: string;
  port: number;
  id: string;
  security: 'aes-128-gcm' | 'chacha20-poly1305' | 'auto' | 'none' | 'zero';
}

export interface VlessOutboundFormSettings {
  address: string;
  port: number;
  id: string;
  flow: string;
  encryption: string;
  reverseTag: string;
  reverseSniffing: Sniffing;
  testpre: number;
  testseed: number[];
}

export interface TrojanOutboundFormSettings {
  address: string;
  port: number;
  password: string;
}

export interface ShadowsocksOutboundFormSettings {
  address: string;
  port: number;
  password: string;
  method: string;
  uot: boolean;
  UoTVersion: number;
}

export interface SocksOutboundFormSettings {
  address: string;
  port: number;
  user: string;
  pass: string;
}

export interface HttpOutboundFormSettings {
  address: string;
  port: number;
  user: string;
  pass: string;
  headers: Record<string, string>;
}

export interface WireguardOutboundFormPeer {
  publicKey: string;
  psk: string;
  allowedIPs: string[];
  endpoint: string;
  keepAlive: number;
}

export interface WireguardOutboundFormSettings {
  mtu: number;
  secretKey: string;
  pubKey: string;
  address: string;
  domainStrategy: '' | 'ForceIP' | 'ForceIPv4' | 'ForceIPv4v6' | 'ForceIPv6' | 'ForceIPv6v4';
  reserved: string;
  peers: WireguardOutboundFormPeer[];
  noKernelTun: boolean;
}

export interface HysteriaOutboundFormSettings {
  address: string;
  port: number;
  version: 2;
}

export interface FreedomFinalRuleForm {
  action: 'allow' | 'block';
  network: string;
  port: string;
  ip: string[];
  blockDelay: string;
}

export interface FreedomOutboundFormSettings {
  domainStrategy: string;
  redirect: string;
  userLevel: number;
  proxyProtocol: 0 | 1 | 2;
  fragment: {
    packets: string;
    length: string;
    interval: string;
    maxSplit: string;
  };
  noises: Array<{
    type: 'rand' | 'str' | 'base64' | 'hex';
    packet: string;
    delay: string;
    applyTo: 'ip' | 'tcp' | 'udp' | 'icmp';
  }>;
  finalRules: FreedomFinalRuleForm[];
}

export interface BlackholeOutboundFormSettings {
  type: '' | 'none' | 'http';
}

export interface DnsRuleForm {
  action: 'direct' | 'drop' | 'return' | 'hijack';
  qType: string;
  domain: string;
  rCode: number;
}

export interface DnsOutboundFormSettings {
  rewriteNetwork: '' | 'udp' | 'tcp';
  rewriteAddress: string;
  rewritePort: number;
  userLevel: number;
  rules: DnsRuleForm[];
}

export interface LoopbackOutboundFormSettings {
  inboundTag: string;
  sniffing: Sniffing;
}

export interface MuxForm {
  enabled: boolean;
  concurrency: number;
  xudpConcurrency: number;
  xudpProxyUDP443: 'reject' | 'allow' | 'skip';
}

export type OutboundFormSettings =
  | VmessOutboundFormSettings
  | VlessOutboundFormSettings
  | TrojanOutboundFormSettings
  | ShadowsocksOutboundFormSettings
  | SocksOutboundFormSettings
  | HttpOutboundFormSettings
  | WireguardOutboundFormSettings
  | HysteriaOutboundFormSettings
  | FreedomOutboundFormSettings
  | BlackholeOutboundFormSettings
  | DnsOutboundFormSettings
  | LoopbackOutboundFormSettings
  | Record<string, unknown>;

export interface OutboundStreamFormValues {
  network?: string;
  security?: string;
  tcpSettings?: unknown;
  kcpSettings?: unknown;
  wsSettings?: unknown;
  grpcSettings?: unknown;
  httpupgradeSettings?: unknown;
  xhttpSettings?: unknown;
  tlsSettings?: unknown;
  realitySettings?: unknown;
  sockopt?: unknown;
  externalProxy?: unknown[];
  enableXmux?: boolean;
  [key: string]: unknown;
}

export const OutboundFormSchema = z.object({
  tag: z.string().default(''),
  protocol: z.string().default('freedom'),
  sendThrough: z.string().optional(),
  targetStrategy: z.string().optional(),
  settings: z.unknown(),
  streamSettings: z.unknown(),
  mux: z.unknown(),
}).passthrough();

export type OutboundFormValues = {
  tag: string;
  protocol: string;
  sendThrough?: string;
  targetStrategy?: string;
  settings?: OutboundFormSettings;
  streamSettings?: OutboundStreamFormValues;
  mux?: MuxForm;
};
