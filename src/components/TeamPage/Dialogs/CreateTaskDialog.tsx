"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  teamId: string
  columnId: string
  onSuccess: () => void
}

export default function CreateTaskDialog({ open, onOpenChange, boardId, teamId, columnId, onSuccess }: Props) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("Task")


  const handleCreate = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    const { data: taskData, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          type,
          board_id: boardId,
          team_id: teamId,
          column_id: columnId,
          created_by: userId,
          position: 0,
        },
      ])
      .select()

    if (!error && taskData) {
      toast.success("Task created")
      onSuccess?.()
      onOpenChange(false)
    } else {
      toast.error("Failed to create task")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={type} onValueChange={(value) => setType(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bug">Bug</SelectItem>
              <SelectItem value="Feature">Feature</SelectItem>
              <SelectItem value="Story">Story</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={!title}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
