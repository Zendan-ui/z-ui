import type { TlsStreamSettings } from '@/schemas/protocols/security/tls';
import type { RealityStreamSettings } from '@/schemas/protocols/security/reality';
import type { TcpStreamSettings } from '@/schemas/protocols/stream/tcp';
import type { KcpStreamSettings } from '@/schemas/protocols/stream/kcp';
import type { WsStreamSettings } from '@/schemas/protocols/stream/ws';
import type { GrpcStreamSettings } from '@/schemas/protocols/stream/grpc';
import type { HttpUpgradeStreamSettings } from '@/schemas/protocols/stream/httpupgrade';
import type { XHttpStreamSettings } from '@/schemas/protocols/stream/xhttp';
import type { SockoptStreamSettings } from '@/schemas/protocols/stream/sockopt';

export interface StreamSettings {
  network?: string;
  security?: string;
  tlsSettings?: TlsStreamSettings;
  realitySettings?: RealityStreamSettings;
  tcpSettings?: TcpStreamSettings;
  kcpSettings?: KcpStreamSettings;
  wsSettings?: WsStreamSettings;
  grpcSettings?: GrpcStreamSettings;
  httpupgradeSettings?: HttpUpgradeStreamSettings;
  xhttpSettings?: XHttpStreamSettings;
  sockopt?: SockoptStreamSettings;
  externalProxy?: unknown[];
}
