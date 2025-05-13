import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { TeamMemberRoles, TeamMemberStatus } from "@/types/supabaseTableData";

export async function POST(request: Request) {
  try {
    const { email, teamId } = await request.json();

    const { data: users, error: userFetchError } = await supabaseAdmin
      .rpc("get_user_id_by_email", { email });

    let userId: string | undefined;

    if (userFetchError) {
      console.error("Error fetching user:", userFetchError);
      return NextResponse.json({ error: "Server error checking user." }, { status: 500 });
    }

    if (users && users.length > 0) {
      userId = users[0].id;
    } else {
      const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password?teamId=${teamId}`,
      });

      if (inviteError) {
        console.error("Error inviting user:", inviteError);
        return NextResponse.json({ error: inviteError.message }, { status: 400 });
      }

      userId = invitedUser.user.id;
      console.log("Invited User:", invitedUser);
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is undefined after invitation." }, { status: 500 });
    }

    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from("user_team")
      .select("id")
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .maybeSingle();

    if (membershipError) {
      console.error("Error checking user_team membership:", membershipError);
      return NextResponse.json({ error: "Failed to check team membership." }, { status: 500 });
    }

    if (existingMembership) {
      return NextResponse.json({ error: "User already in this team." }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("user_team").insert({
      user_id: userId,
      team_id: teamId,
      role: TeamMemberRoles.USER,
      status: TeamMemberStatus.AWAITING,
    });

    if (insertError) {
      console.error("Error inserting user_team record:", insertError);
      return NextResponse.json({ error: "Failed to create team membership." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent." });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}