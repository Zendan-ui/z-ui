import { z } from 'zod';

export const Protocols = [
  'vmess', 'vless', 'trojan', 'shadowsocks', 'wireguard',
  'hysteria', 'http', 'mixed', 'tunnel', 'tun', 'mtproto',
] as const;

export type Protocol = typeof Protocols[number];

export const OutboundProtocols = [
  'freedom', 'blackhole', 'dns', 'vmess', 'vless', 'trojan',
  'shadowsocks', 'socks', 'http', 'wireguard', 'hysteria', 'loopback',
] as const;

export type OutboundProtocol = typeof OutboundProtocols[number];

export const UTLS_FINGERPRINT = {
  randomized: 'randomized',
  random: 'random',
  chrome: 'chrome',
  firefox: 'firefox',
  safari: 'safari',
  ios: 'ios',
  android: 'android',
  edge: 'edge',
  '360': '360',
  qq: 'qq',
} as const;

export const ALPN_OPTION = {
  h3: 'h3',
  h2: 'h2',
  'http/1.1': 'http/1.1',
} as const;

export const TLS_VERSION_OPTION = {
  '1.0': '1.0',
  '1.1': '1.1',
  '1.2': '1.2',
  '1.3': '1.3',
} as const;

export const TLS_CIPHER_OPTION = {
  'TLS_RSA_WITH_AES_128_CBC_SHA': 'TLS_RSA_WITH_AES_128_CBC_SHA',
  'TLS_RSA_WITH_AES_256_CBC_SHA': 'TLS_RSA_WITH_AES_256_CBC_SHA',
  'TLS_RSA_WITH_AES_128_GCM_SHA256': 'TLS_RSA_WITH_AES_128_GCM_SHA256',
  'TLS_RSA_WITH_AES_256_GCM_SHA384': 'TLS_RSA_WITH_AES_256_GCM_SHA384',
  'TLS_AES_128_GCM_SHA256': 'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384': 'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256': 'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA': 'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA': 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
  'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA': 'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA': 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
  'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256': 'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
  'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256': 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
  'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384': 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
  'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384': 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
  'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256': 'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
  'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256': 'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
} as const;

export const DOMAIN_STRATEGY_OPTION = {
  AsIs: 'AsIs',
  UseIP: 'UseIP',
  UseIPv4: 'UseIPv4',
  UseIPv6: 'UseIPv6',
  UseIPv4v6: 'UseIPv4v6',
  UseIPv6v4: 'UseIPv6v4',
  ForceIP: 'ForceIP',
  ForceIPv4: 'ForceIPv4',
  ForceIPv6: 'ForceIPv6',
  ForceIPv4v6: 'ForceIPv4v6',
  ForceIPv6v4: 'ForceIPv6v4',
} as const;

export const SNIFFING_OPTION = {
  http: 'http',
  tls: 'tls',
  quic: 'quic',
  fakedns: 'fakedns',
} as const;

export const TCP_CONGESTION_OPTION = {
  bbr: 'bbr',
  cubic: 'cubic',
  reno: 'reno',
} as const;

export const USAGE_OPTION = {
  encipherment: 'encipherment',
  verify: 'verify',
  issue: 'issue',
  'verifyclient-once': 'verifyclient-once',
} as const;

export const TLS_FLOW_CONTROL = {
  '': '',
  'xtls-rprx-vision': 'xtls-rprx-vision',
  'xtls-rprx-vision-udp443': 'xtls-rprx-vision-udp443',
} as const;

export type SniffingDest = 'http' | 'tls' | 'quic' | 'fakedns';

export const SniffingDestSchema = z.enum(['http', 'tls', 'quic', 'fakedns']);

export interface Sniffing {
  enabled: boolean;
  destOverride: SniffingDest[];
  metadataOnly: boolean;
  routeOnly: boolean;
  ipsExcluded: string[];
  domainsExcluded: string[];
}
