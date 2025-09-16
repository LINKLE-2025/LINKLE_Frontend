import { create } from "zustand";
import { getCurrentUserInfo } from "@/api/authApi";
import { UserInfo } from "@/types/auth";

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  setUser: (user: UserInfo | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

// 전역 인증 상태 관리 스토어
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const data = await getCurrentUserInfo();
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: () => {
    set({ user: null });
    window.location.href = "/login";
  },
}));
