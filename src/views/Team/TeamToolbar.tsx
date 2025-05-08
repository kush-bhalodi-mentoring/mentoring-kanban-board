"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/utils/supabase/client"
import { toast } from "sonner"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"

type Props = {
    teamId: string
  }

export default function TeamToolbar({ teamId }: Props) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editTeamOpen, setEditTeamOpen] = useState(false)
  const [editMembersOpen, setEditMembersOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDesc, setTeamDesc] = useState("")
  const [members, setMembers] = useState<{ id: string; email: string }[]>([])

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: userTeam } = await supabase
        .from(TABLE.USER_TEAM)
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("team_id", teamId)
        .single()

      if (userTeam?.role === "Admin") setIsAdmin(true)
    }

    const fetchTeamInfo = async () => {
      const { data } = await supabase
        .from(TABLE.TEAMS)
        .select("name, description")
        .eq("id", teamId)
        .single()
      if (data) {
        setTeamName(data.name)
        setTeamDesc(data.description)
      }
    }

    fetchUserRole()
    fetchTeamInfo()
  }, [teamId])

  const updateTeam = async () => {
    const { error } = await supabase
      .from(TABLE.TEAMS)
      .update({ name: teamName, description: teamDesc })
      .eq("id", teamId)

    if (error) toast.error("Failed to update team")
    else {
      toast.success("Team updated")
      setEditTeamOpen(false)
    }
  }

  const openMembersModal = async () => {
    const { data, error } = await supabase
      .from("team_members_with_email")
      .select("*")
      .eq("team_id", teamId)

    if(error){
      console.error(error)
    }

    if (data) {
        setMembers(
            (data as { user_id: string; email: string }[]).map((entry) => ({
              id: entry.user_id,
              email: entry.email,
            }))
          )
      setEditMembersOpen(true)
    }
  }

  const removeMember = async (userId: string) => {
    const { error } = await supabase
      .from(TABLE.USER_TEAM)
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)

    if (error) toast.error("Failed to remove user")
    else {
      toast.success("User removed")
      setMembers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  if (!isAdmin) return null

  return (
    <div className="flex space-x-4 mb-6">
      <Button onClick={() => setEditTeamOpen(true)}>Edit Team Configuration</Button>
      <Button onClick={openMembersModal}>Edit Team Members</Button>

      {/* Edit Team Modal */}
      <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Configuration</DialogTitle>
          </DialogHeader>
          <Label>Team Name</Label>
          <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <Label>Description</Label>
          <Input value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
          <Button onClick={updateTeam} className="mt-4">Save</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Members Modal */}
      <Dialog open={editMembersOpen} onOpenChange={setEditMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center">
                <span>{member.email}</span>
                <Button variant="destructive" onClick={() => removeMember(member.id)}>Remove</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
