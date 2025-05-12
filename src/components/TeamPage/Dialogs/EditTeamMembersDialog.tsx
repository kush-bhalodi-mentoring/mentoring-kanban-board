"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { useEffect, useState } from "react"

type Member = {
  id: string
  email: string
  role: string
}

type EditTeamMembersDialogProps = {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditTeamMembersDialog({
  teamId,
  open,
  onOpenChange,
}: EditTeamMembersDialogProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("team_members_with_email") // make sure this includes `role`
        .select("user_id, email, role")
        .eq("team_id", teamId)

      if (error) {
        toast.error("Failed to fetch members")
        return
      }

      const parsed = data?.map((entry) => ({
        id: entry.user_id,
        email: entry.email || "Unknown",
        role: entry.role || "Member",
      }))

      setMembers(parsed)
    }

    fetchMembers()
  }, [open, teamId])

  const handleRemove = async (userId: string) => {
    setLoading(true)

    const { error } = await supabase
      .from(TABLE.USER_TEAM)
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)

      console.log(teamId)

    setLoading(false)

    if (error) {
      toast.error("Failed to remove member")
    } else {
      toast.success("Member removed")
      setMembers((prev) => prev.filter((m) => m.id !== userId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.length === 0 && <p>No members found.</p>}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center px-2 py-1"
            >
              <div>
                <p className="text-sm font-medium">{member.email}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
              {member.role !== "Admin" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(member.id)}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
