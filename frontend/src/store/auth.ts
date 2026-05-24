import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: {
    id: number;
    username: string;
    role: string;
    email: string;
    language: string;
    two_fa: boolean;
  } | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setAdmin: (admin: AuthState['admin']) => void;
  login: (data: { access_token: string; refresh_token: string; admin: AuthState['admin'] }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      setAdmin: (admin) => set({ admin }),

      login: (data) =>
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          admin: data.admin,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          admin: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'z-ui-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
