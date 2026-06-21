"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("fetchProfile error:", error);
        setProfile(null);
      } else {
        setProfile(data ?? null);
      }
    } catch (err) {
      console.error("fetchProfile exception:", err);
      setProfile(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      setUser(currentUser ?? null);
      if (currentUser) {
        // Fetch in background, do not block refresh completion
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("refresh error:", err);
      setUser(null);
      setProfile(null);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const init = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("Auth getUser error on init:", error);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }
        
        if (!mounted) return;
        setUser(currentUser ?? null);
        if (currentUser) {
          // Do not await fetchProfile to prevent database/network queries from blocking initial UI loading
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init exception:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!mounted) return;
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            // Do not await fetchProfile to prevent thread blocks on state transition
            fetchProfile(currentUser.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("onAuthStateChange exception:", err);
          if (mounted) {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return { user, profile, loading, refresh };
}
