import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const store = useAuthStore.getState();
          if (store.refreshToken) {
            try {
              const resp = await axios.post(`${API_BASE}/auth/refresh`, {
                refresh_token: store.refreshToken,
              });
              store.setTokens(resp.data.access_token, resp.data.refresh_token);
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${resp.data.access_token}`;
                return this.client(error.config);
              }
            } catch {
              store.logout();
              window.location.href = '/login';
            }
          } else {
            store.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  login = (data: { username: string; password: string; totp_code?: string }) =>
    this.client.post('/auth/login', data);
  logout = () => this.client.post('/auth/logout');
  me = () => this.client.get('/auth/me');
  changePassword = (data: { old_password: string; new_password: string }) =>
    this.client.post('/auth/change-password', data);

  // Dashboard
  dashboard = () => this.client.get('/dashboard');
  trafficStats = (period: string) => this.client.get(`/dashboard/traffic?period=${period}`);
  onlineUsers = () => this.client.get('/dashboard/online');

  // Users
  getUsers = (params?: Record<string, string>) =>
    this.client.get('/users', { params });
  getUser = (id: number) => this.client.get(`/users/${id}`);
  createUser = (data: any) => this.client.post('/users', data);
  updateUser = (id: number, data: any) => this.client.put(`/users/${id}`, data);
  deleteUser = (id: number) => this.client.delete(`/users/${id}`);
  getUserStats = () => this.client.get('/users/stats');
  resetTraffic = (id: number) => this.client.post(`/users/${id}/reset-traffic`);
  suspendUser = (id: number) => this.client.post(`/users/${id}/suspend`);
  activateUser = (id: number) => this.client.post(`/users/${id}/activate`);
  revokeSubscription = (id: number) => this.client.post(`/users/${id}/revoke-sub`);
  getUserUsage = (id: number, days?: number) =>
    this.client.get(`/users/${id}/usage?days=${days || 30}`);
  getUserDevices = (id: number) => this.client.get(`/users/${id}/devices`);

  // Servers
  getServers = () => this.client.get('/servers');
  getServer = (id: number) => this.client.get(`/servers/${id}`);
  createServer = (data: any) => this.client.post('/servers', data);
  updateServer = (id: number, data: any) => this.client.put(`/servers/${id}`, data);
  deleteServer = (id: number) => this.client.delete(`/servers/${id}`);
  getServerStatus = (id: number) => this.client.get(`/servers/${id}/status`);

  // Inbounds
  getInbounds = (params?: Record<string, string>) =>
    this.client.get('/inbounds', { params });
  getInbound = (id: number) => this.client.get(`/inbounds/${id}`);
  createInbound = (data: any) => this.client.post('/inbounds', data);
  updateInbound = (id: number, data: any) => this.client.put(`/inbounds/${id}`, data);
  deleteInbound = (id: number) => this.client.delete(`/inbounds/${id}`);
  toggleInbound = (id: number) => this.client.post(`/inbounds/${id}/toggle`);

  // Subscriptions
  getSubscriptions = (params?: Record<string, string>) =>
    this.client.get('/subscriptions', { params });
  getSubscription = (id: number) => this.client.get(`/subscriptions/${id}`);
  createSubscription = (data: any) => this.client.post('/subscriptions', data);
  deleteSubscription = (id: number) => this.client.delete(`/subscriptions/${id}`);
  regenerateSubscription = (id: number) => this.client.post(`/subscriptions/${id}/regenerate`);
  getSubscriptionLogs = (id: number) => this.client.get(`/subscriptions/${id}/logs`);
  getSubscriptionAnalytics = (userId: number) =>
    this.client.get(`/subscriptions/analytics/${userId}`);

  // System
  getSettings = () => this.client.get('/system/settings');
  updateSettings = (data: Record<string, string>) =>
    this.client.put('/system/settings', data);
  getAuditLogs = (page?: number) => this.client.get(`/system/audit-logs?page=${page || 1}`);

  // Tunnels
  getTunnels = () => this.client.get('/tunnels');
  getTunnel = (id: number) => this.client.get(`/tunnels/${id}`);
  createTunnel = (data: any) => this.client.post('/tunnels', data);
  updateTunnel = (id: number, data: any) => this.client.put(`/tunnels/${id}`, data);
  deleteTunnel = (id: number) => this.client.delete(`/tunnels/${id}`);
  toggleTunnel = (id: number) => this.client.post(`/tunnels/${id}/toggle`);
}

export const api = new ApiClient();
export default api;
