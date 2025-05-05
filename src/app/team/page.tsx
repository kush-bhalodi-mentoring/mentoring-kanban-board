import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/constants/routes";
import { DB_TABLE_NAMES } from "@/constants/databaseTableNames";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  
  if (!data?.user) {
    throw new Error("User not found, unexpected state.");
  }

  const userId = data.user.id;

  const { data: userTeam, error: teamError } = await supabase
    .from(DB_TABLE_NAMES.USER_TEAM)
    .select("team_id")
    .eq("user_id", userId)
    .single();

  if (teamError || !userTeam) {
    redirect(ROUTES.TEAM_JOIN);
  }

  redirect(ROUTES.TEAM_ID(userTeam.team_id));
}