export interface Admin {
  id: number;
  uuid: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'viewer';
  two_factor_enabled: boolean;
  telegram_id: number;
  is_active: boolean;
  last_login: string | null;
  language: string;
  created_at: string;
}

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  telegram_id: number;
  status: 'active' | 'disabled' | 'expired' | 'limited';
  traffic_limit: number;
  traffic_used: number;
  traffic_up: number;
  traffic_down: number;
  expires_at: string | null;
  device_limit: number;
  online_devices: number;
  sub_token: string;
  sub_short_link: string;
  note: string;
  admin_id: number;
  auto_renew: boolean;
  renew_days: number;
  renew_traffic: number;
  tags: string;
  proxies?: Proxy[];
  subscriptions?: Subscription[];
  devices?: Device[];
  created_at: string;
  updated_at: string;
}

export interface Proxy {
  id: number;
  uuid: string;
  user_id: number;
  inbound_id: number;
  inbound?: Inbound;
  protocol: string;
  settings: string;
  flow_type: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Inbound {
  id: number;
  uuid: string;
  tag: string;
  protocol: Protocol;
  port: number;
  listen: string;
  transport: Transport;
  security: Security;
  settings: string;
  stream_settings: string;
  sniffing: string;
  server_id: number;
  server?: Server;
  is_active: boolean;
  remark: string;
  proxies?: Proxy[];
  created_at: string;
}

export interface Server {
  id: number;
  uuid: string;
  name: string;
  host: string;
  port: number;
  api_port: number;
  type: 'master' | 'node';
  status: 'online' | 'offline' | 'error';
  location: string;
  country_code: string;
  isp: string;
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  network_in: number;
  network_out: number;
  xray_version: string;
  singbox_version: string;
  weight: number;
  max_users: number;
  tags: string;
  inbounds?: Inbound[];
  created_at: string;
}

export interface Subscription {
  id: number;
  uuid: string;
  user_id: number;
  user?: User;
  name: string;
  token: string;
  short_link: string;
  format: string;
  proxy_ids: string;
  server_ids: string;
  include: string;
  exclude: string;
  is_active: boolean;
  hit_count: number;
  last_access: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Device {
  id: number;
  user_id: number;
  ip: string;
  user_agent: string;
  client_type: string;
  last_seen: string;
  is_online: boolean;
  created_at: string;
}

export interface TrafficLog {
  id: number;
  user_id: number;
  upload: number;
  download: number;
  period: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  action: string;
  resource: string;
  resource_id: number;
  details: string;
  ip: string;
  created_at: string;
}

export interface DashboardData {
  users: { total: number; active: number; online?: number };
  servers: number;
  inbounds: number;
  traffic: { up: number; down: number; total: number };
  system: {
    hostname: string;
    uptime: number;
    cpu_usage: number;
    cpu_cores: number;
    mem_total: number;
    mem_used: number;
    mem_percent: number;
    disk_percent: number;
    load_avg: number[];
    goroutines: number;
    memory_alloc: number;
    memory_sys: number;
    go_version: string;
    os: string;
    arch: string;
    cpus: number;
  };
  recent_users: User[];
  version: string;
}

export type Protocol = 'vless' | 'vmess' | 'trojan' | 'shadowsocks' | 'hysteria2' | 'tuic' | 'wireguard' | 'socks' | 'ssh';
export type Transport = 'tcp' | 'ws' | 'grpc' | 'quic' | 'kcp' | 'xhttp' | 'httpupgrade' | 'splithttp';
export type Security = 'none' | 'tls' | 'reality';

export interface LoginRequest {
  username: string;
  password: string;
  totp_code?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  admin: {
    id: number;
    username: string;
    role: string;
    email: string;
    language: string;
    two_fa: boolean;
  };
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  [key: string]: T[] | number;
}
