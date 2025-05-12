"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
//import { supabase } from "@/utils/supabase/client";
//import { ROUTES } from "@/constants/routes";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    /*const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          router.push(ROUTES.LOGIN);
        }
      }
    );

    return () => listener.subscription.unsubscribe();*/
  }, [router]);

  return <>{children}</>;
}