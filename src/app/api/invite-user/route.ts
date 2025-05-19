import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { TeamMemberRoles, TeamMemberStatus } from "@/types/supabaseTableData"

type APIError = {
  message: string;
  [key: string]: unknown;
};

const throwIfError = (error: APIError | Error, status: number = 500) => {
  console.error(error);
  return NextResponse.json(
    { error: "message" in error ? error.message : "Unexpected error." },
    { status }
  );
};

export async function POST(request: Request) {
  try {
    const { email, teamId } = await request.json()

    const { data: users, error: userFetchError } = await supabaseAdmin
      .rpc("get_user_id_by_email", { email })

    if (userFetchError) return throwIfError(userFetchError)

    if (!users || users.length === 0) {
      return throwIfError({ message: "User not found." }, 404)
    }

    const userId = users[0].id

    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from("user_team")
      .select("id")
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .maybeSingle()

    if (membershipError) return throwIfError(membershipError)

    if (existingMembership) {
      return throwIfError({ message: "User already in this team." }, 400)
    }

    const { error: insertError } = await supabaseAdmin.from("user_team").insert({
      user_id: userId,
      team_id: teamId,
      role: TeamMemberRoles.USER,
      status: TeamMemberStatus.ACTIVE,
    })

    if (insertError) return throwIfError(insertError)

    return NextResponse.json({ success: true, message: "User added to team successfully." })

  } catch (error) {
    return throwIfError(error as Error)
  }
}