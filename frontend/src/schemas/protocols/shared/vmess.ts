export const VMESS_SECURITY_OPTIONS = [
  'auto', 'aes-128-gcm', 'chacha20-poly1305', 'none', 'zero',
] as const;

export type VmessSecurity = typeof VMESS_SECURITY_OPTIONS[number];
