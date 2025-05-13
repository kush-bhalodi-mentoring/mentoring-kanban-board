"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { ROUTES } from "@/constants/routes";
import { PUBLIC_PATHS } from "@/constants/publicPaths";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      const currentPath = window.location.pathname;

      const isPublicPath = PUBLIC_PATHS.some((path) =>
        currentPath.startsWith(path)
      );

      if (event === "SIGNED_OUT" && !isPublicPath) {
        router.push(ROUTES.LOGIN);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}