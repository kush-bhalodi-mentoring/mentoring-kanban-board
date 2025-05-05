import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function TeamPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    throw new Error("User not found, unexpected state.")
  }

  const userId = data.user.id  
  const { data: userTeam, error: teamError } = await supabase
    .from("user_team")
    .select("team_id")
    .eq("user_id", userId)
    .single()

  if (teamError || !userTeam) {
    redirect("/team/join")
  }
  redirect(`/team/${userTeam.team_id}`)
}
