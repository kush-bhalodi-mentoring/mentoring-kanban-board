"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import SetPasswordForm from "@/components/SetPasswordForm";
import { ROUTES } from "@/constants/routes";
import { TeamMemberStatus } from "@/types/supabaseTableData";

export default function SetPasswordView() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const teamId = searchParams.get("teamId");

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    setToken(hashParams.get("access_token"));
    setRefreshToken(hashParams.get("refresh_token"));
  }, []);

  const handleSetPassword = async (
    password: string,
    confirmPassword: string,
    setError: (msg: string) => void,
    setSuccess: (v: boolean) => void,
    setLoading: (v: boolean) => void
  ) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 10 characters, with a capital letter, lowercase letter, and special character"
      );
      return;
    }

    if (!token || !refreshToken) {
      setError("Invalid or missing token");
      return;
    }

    setLoading(true);

    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      const email = user?.email;
      if (!email || !userId) throw new Error("User info not found");

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      const {
        data: { session: postUpdateSession },
        error: postUpdateSessionError,
      } = await supabase.auth.getSession();
      if (postUpdateSessionError || !postUpdateSession) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      if (userId && teamId) {
        const { error: statusUpdateError } = await supabase
          .from("user_team")
          .update({ status: TeamMemberStatus.ACTIVE })
          .eq("user_id", userId)
          .eq("team_id", teamId);

        if (statusUpdateError) {
          throw new Error(statusUpdateError.message || "Failed to update team status");
        }
      }

      setSuccess(true);
      router.push(ROUTES.TEAM_ID(teamId!));
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return <SetPasswordForm onSetPassword={handleSetPassword} />;
}