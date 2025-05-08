"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"


type EditTeamDialogProps = {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  initialDescription: string
  onSuccess?: (newName: string, newDescription: string) => void
}

export default function EditTeamDialog({
  teamId,
  open,
  onOpenChange,
  initialName,
  initialDescription,
  onSuccess,
}: EditTeamDialogProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from(TABLE.TEAMS)
      .update({ name, description })
      .eq("id", teamId)

    setLoading(false)

    if (error) {
      toast.error("Failed to update team")
    } else {
      toast.success("Team updated successfully")
      onOpenChange(false)
      onSuccess?.(name, description)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Configuration</DialogTitle>
        </DialogHeader>
        <Label>Team Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Label className="mt-2">Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={handleUpdate} className="mt-4" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
