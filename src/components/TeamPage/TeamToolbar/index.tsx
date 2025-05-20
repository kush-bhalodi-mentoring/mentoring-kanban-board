"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Users, UserPlus, Columns } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import EditTeamDialog from "@/components/TeamPage/Dialogs/EditTeamDialog"
import EditTeamMembersDialog from "@/components/TeamPage/Dialogs/EditTeamMembersDialog"
import InviteUserDialog from "@/components/TeamPage/Dialogs/InviteUserDialog"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"

type TeamToolbarProps = {
  teamId: string
  initialName: string
  initialDescription: string
  boardId: string | null
  columnDialogOpen: boolean
  setColumnDialogOpen: (open: boolean) => void
  onColumnsUpdate: () => void
  onTeamUpdate?: (newName: string, newDescription: string) => void
}

type Member = {
  id: string
  email: string
}

export default function TeamToolbar({
  teamId,
  initialName,
  initialDescription,
  boardId,
  columnDialogOpen,
  setColumnDialogOpen,
  onColumnsUpdate,
  onTeamUpdate,
}: TeamToolbarProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editTeamOpen, setEditTeamOpen] = useState(false)
  const [editMembersOpen, setEditMembersOpen] = useState(false)
  const [inviteUserOpen, setInviteUserOpen] = useState(false)
  const [teamName, setTeamName] = useState(initialName)
  const [teamDesc, setTeamDesc] = useState(initialDescription)
  const [, setMembers] = useState<Member[]>([])

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
    fetchTeamMembers()
  }, [checkAdminStatus, fetchTeamMembers])

  const toggleEditTeamDialog = () => {
    setEditTeamOpen((prev) => !prev)
  }

  const toggleEditMembersDialog = () => {
    setEditMembersOpen((prev) => !prev)
  }

  const toggleInviteUserDialog = () => {
    setInviteUserOpen((prev) => !prev)
  }

  const handleTeamUpdate = (newName: string, newDescription: string) => {
    setTeamName(newName)
    setTeamDesc(newDescription)
    onTeamUpdate?.(newName, newDescription)
  }

  if (!isAdmin) return null

  return (
    <>
      <Button
        variant="ghost"
        className="py-[2px] px-[4px] text-sm font-semibold text-muted-foreground flex items-center gap-1"
        onClick={toggleEditTeamDialog}
      >
        <Settings className="w-4 h-4" />
        Team Configuration
      </Button>

      <Button
        variant="ghost"
        className="py-[2px] px-[4px] text-sm font-semibold text-muted-foreground flex items-center gap-1"
        onClick={toggleEditMembersDialog}
      >
        <Users className="w-4 h-4" />
        Team Members
      </Button>

      <Button
        variant="ghost"
        className="py-[2px] px-[4px] text-sm font-semibold text-muted-foreground flex items-center gap-1"
        onClick={toggleInviteUserDialog}
      >
        <UserPlus className="w-4 h-4" />
        Invite User
      </Button>

      <Button
        variant="ghost"
        className="py-[2px] px-[4px] text-sm font-semibold text-muted-foreground flex items-center gap-1"
        onClick={() => setColumnDialogOpen(true)}
        disabled={!boardId}
      >
        <Columns className="w-4 h-4" />
        Manage Columns
      </Button>

      <EditTeamDialog
        teamId={teamId}
        open={editTeamOpen}
        onOpenChange={setEditTeamOpen}
        initialName={teamName}
        initialDescription={teamDesc}
        onSuccess={handleTeamUpdate}
      />

      <EditTeamMembersDialog
        teamId={teamId}
        open={editMembersOpen}
        onOpenChange={setEditMembersOpen}
      />

      <InviteUserDialog
        open={inviteUserOpen}
        onOpenChange={setInviteUserOpen}
      />

      {boardId && (
        <ColumnManagerDialog
          boardId={boardId}
          open={columnDialogOpen}
          onOpenChange={setColumnDialogOpen}
          onSuccess={() => {
            onColumnsUpdate()
            setColumnDialogOpen(false)
          }}
        />
      )}
    </>
  )
}