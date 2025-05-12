import { supabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
import { TeamMemberStatus } from "@/types/supabaseTableData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const teamId = searchParams.get("teamId");

  if (!userId || !teamId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("user_team")
    .update({ status: TeamMemberStatus.ACTIVE })
    .eq("user_id", userId)
    .eq("team_id", teamId);

  if (error) {
    console.error("Error activating team invite:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}`);
}