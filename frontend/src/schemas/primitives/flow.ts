export const TLS_FLOW_CONTROL = {
  '': '',
  'xtls-rprx-vision': 'xtls-rprx-vision',
  'xtls-rprx-vision-udp443': 'xtls-rprx-vision-udp443',
} as const;

export type TlsFlowControl = keyof typeof TLS_FLOW_CONTROL;
