import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>(set => ({
  session: null,
  loading: true,
  setSession: session => set({ session }),
  setLoading: loading => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));

export default useAuthStore;
