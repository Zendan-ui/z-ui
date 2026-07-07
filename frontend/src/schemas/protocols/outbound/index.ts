import { z } from 'zod';
export { BlackholeOutboundSettingsSchema } from './blackhole';
export type { BlackholeOutboundSettings } from './blackhole';
export { DnsOutboundSettingsSchema } from './dns';
export type { DNSOutboundSettings } from './dns';
export { FreedomOutboundSettingsSchema } from './freedom';
export type { FreedomOutboundSettings } from './freedom';
export { LoopbackOutboundSettingsSchema } from './loopback';
export type { LoopbackOutboundSettings } from './loopback';
export { HttpOutboundSettingsSchema } from './http';
export type { HttpOutboundSettings } from './http';
export { SocksOutboundSettingsSchema } from './socks';
export type { SocksOutboundSettings } from './socks';
export { TrojanOutboundSettingsSchema } from './trojan';
export type { TrojanOutboundSettings } from './trojan';
export { ShadowsocksOutboundSettingsSchema } from './shadowsocks';
export type { ShadowsocksOutboundSettings } from './shadowsocks';
export { VlessOutboundSettingsSchema } from './vless';
export type { VlessOutboundSettings } from './vless';
export { VmessOutboundSettingsSchema } from './vmess';
export type { VmessOutboundSettings } from './vmess';
export { HysteriaOutboundSettingsSchema } from './hysteria';
export type { HysteriaOutboundSettings } from './hysteria';
export { WireguardOutboundSettingsSchema } from './wireguard';
export type { WireguardOutboundSettings } from './wireguard';

export const OUTBOUND_DOMAIN_STRATEGIES = [
  'AsIs', 'UseIP', 'UseIPv4', 'UseIPv6', 'UseIPv4v6', 'UseIPv6v4',
  'ForceIP', 'ForceIPv4', 'ForceIPv6', 'ForceIPv4v6', 'ForceIPv6v4',
] as const;

export const OutboundDomainStrategySchema = z.enum(OUTBOUND_DOMAIN_STRATEGIES);
export type OutboundDomainStrategy = z.infer<typeof OutboundDomainStrategySchema>;
