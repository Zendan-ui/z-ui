import { z } from 'zod';
export { VlessClientSchema, VlessInboundSettingsSchema } from './vless';
export type { VlessClient, VlessInboundSettings } from './vless';
export { VmessClientSchema, VmessInboundSettingsSchema } from './vmess';
export type { VmessClient, VmessInboundSettings } from './vmess';
export { TrojanClientSchema, TrojanInboundSettingsSchema } from './trojan';
export type { TrojanClient, TrojanInboundSettings } from './trojan';
export { ShadowsocksClientSchema, ShadowsocksInboundSettingsSchema } from './shadowsocks';
export type { ShadowsocksClient, ShadowsocksInboundSettings } from './shadowsocks';
export { HysteriaClientSchema, HysteriaInboundSettingsSchema } from './hysteria';
export type { HysteriaClient, HysteriaInboundSettings } from './hysteria';
export { HttpInboundSettingsSchema } from './http';
export type { HttpInboundSettings } from './http';
export { MixedInboundSettingsSchema } from './mixed';
export type { MixedInboundSettings } from './mixed';
export { MtprotoClientSchema, MtprotoInboundSettingsSchema } from './mtproto';
export type { MtprotoClient, MtprotoInboundSettings } from './mtproto';
export { TunInboundSettingsSchema } from './tun';
export type { TunInboundSettings } from './tun';
export { TunnelInboundSettingsSchema } from './tunnel';
export type { TunnelInboundSettings } from './tunnel';
export { WireguardClientSchema, WireguardInboundSettingsSchema } from './wireguard';
export type { WireguardClient, WireguardInboundSettings } from './wireguard';

export const InboundSettingsSchema = z.union([
  z.object({ clients: z.array(z.unknown()) }),
  z.record(z.unknown()),
]);

export type InboundSettings = z.infer<typeof InboundSettingsSchema>;
