"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import {
  createSupabaseBrowserClient,
  isSupabaseAuthConfigured,
} from "@/lib/supabase/browser";

type SupabaseUserState = {
  isConfigured: boolean;
  isLoading: boolean;
  user: User | null;
};

export function useSupabaseUser(): SupabaseUserState {
  const isConfigured = isSupabaseAuthConfigured();
  const supabaseClient = isConfigured ? createSupabaseBrowserClient() : null;
  const [isLoading, setIsLoading] = useState(() => Boolean(supabaseClient));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isConfigured || !supabaseClient) {
      return;
    }

    let isMounted = true;
    const loadingFallback = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      setIsLoading(false);
    }, 4000);

    const loadSession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();

        if (!isMounted) {
          return;
        }

        setUser(data.session?.user ?? null);
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setIsLoading(false);
      }
    };

    void loadSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      window.clearTimeout(loadingFallback);
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured, supabaseClient]);

  return { isConfigured, isLoading, user };
}
