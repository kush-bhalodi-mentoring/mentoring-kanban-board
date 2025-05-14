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

    let userId: string | undefined

    if (users && users.length > 0) {
      userId = users[0].id

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

      const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/join-team?teamId=${teamId}`,
        },
      })

      if (linkError) return throwIfError(linkError)

      const { error: insertError } = await supabaseAdmin.from("user_team").insert({
        user_id: userId,
        team_id: teamId,
        role: TeamMemberRoles.USER,
        status: TeamMemberStatus.AWAITING,
      })

      if (insertError) return throwIfError(insertError)

      return NextResponse.json({ success: true, message: "Magic link sent to existing user." })
    }

    const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password?teamId=${teamId}`,
    })

    if (inviteError) return throwIfError(inviteError, 400)

    userId = invitedUser.user.id

    if (!userId) {
      return throwIfError({ message: "User ID is undefined after invitation." })
    }

    const { error: insertInviteError } = await supabaseAdmin.from("user_team").insert({
      user_id: userId,
      team_id: teamId,
      role: TeamMemberRoles.USER,
      status: TeamMemberStatus.AWAITING,
    })

    if (insertInviteError) return throwIfError(insertInviteError)

    return NextResponse.json({ success: true, message: "Invitation sent to new user." })
  } catch (error) {
    return throwIfError(error as Error)
  }
}