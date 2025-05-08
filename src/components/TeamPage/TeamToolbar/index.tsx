"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import EditTeamDialog from "@/components/TeamPage/Dialogs/EditTeamDialog"
import EditTeamMembersDialog from "@/components/TeamPage/Dialogs/EditTeamMembersDialog"

type TeamToolbarProps = {
  teamId: string
}

type Member = {
  id: string
  email: string
}

export default function TeamToolbar({ teamId }: TeamToolbarProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editTeamOpen, setEditTeamOpen] = useState(false)
  const [editMembersOpen, setEditMembersOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDesc, setTeamDesc] = useState("")
  const [, setMembers] = useState<Member[]>([])

  // Fetch user role (Admin check)
  const checkAdminStatus = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return

    const { data: userTeam } = await supabase
      .from(TABLE.USER_TEAM)
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("team_id", teamId)
      .single()

    if (userTeam?.role === "Admin") {
      setIsAdmin(true)
    }
  }, [teamId])

  // Fetch team details
  const fetchTeamInfo = useCallback(async () => {
    const { data } = await supabase
      .from(TABLE.TEAMS)
      .select("name, description")
      .eq("id", teamId)
      .single()

    if (data) {
      setTeamName(data.name)
      setTeamDesc(data.description)
    }
  }, [teamId])

  // Fetch team members (wrapped in useCallback)
  const fetchTeamMembers = useCallback(async () => {
    const { data } = await supabase
      .from("team_members_with_email")
      .select("*")
      .eq("team_id", teamId)

    if (data) {
      setMembers(
        (data as { user_id: string; email: string }[]).map((entry) => ({
          id: entry.user_id,
          email: entry.email,
        }))
      )
    }
  }, [teamId])

  useEffect(() => {
    checkAdminStatus()
    fetchTeamInfo()
    fetchTeamMembers() // For members when toolbar is loaded
  }, [checkAdminStatus, fetchTeamInfo, fetchTeamMembers, teamId])

  const toggleEditTeamDialog = () => {
    setEditTeamOpen((prev) => !prev)
  }

  const toggleEditMembersDialog = () => {
    setEditMembersOpen((prev) => !prev)
  }

  if (!isAdmin) return null

  return (
    <div className="flex space-x-4 mb-6">
      <Button onClick={toggleEditTeamDialog}>Edit Team Configuration</Button>
      <Button onClick={toggleEditMembersDialog}>Edit Team Members</Button>

      {/* Edit Team Modal */}
<EditTeamDialog
  teamId={teamId}
  open={editTeamOpen}
  onOpenChange={setEditTeamOpen}
  initialName={teamName}
  initialDescription={teamDesc}
  onSuccess={(name, desc) => {
    setTeamName(name)
    setTeamDesc(desc)
  }}
/>

{/* Edit Members Modal */}
<EditTeamMembersDialog
  teamId={teamId}
  open={editMembersOpen}
  onOpenChange={setEditMembersOpen}
/>
    </div>
  )
}
