"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"
import DatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"

type Props = {
  task: {
    id: string
    title: string
    type: string
    assigned_to: string | null
    due_date?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  teamId: string
}

type TaskType = 'Bug' | 'Feature' | 'Story'

export default function EditTaskDialog({ task, open, onOpenChange, onSuccess, teamId }: Props) {
  const [editedTitle, setEditedTitle] = useState(task.title)
  const defaultType: TaskType = ['Bug', 'Feature', 'Story'].includes(task.type as TaskType)
  ? (task.type as TaskType)
  : 'Bug'
  const [editedType, setEditedType] = useState<TaskType>(defaultType)
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "")
  const [dueDate, setDueDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date) : null
  )
  const [teamUsers, setTeamUsers] = useState<{ id: string; email: string }[]>([])

  useEffect(() => {
    setEditedTitle(task.title)

    const validTypes: TaskType[] = ["Bug", "Feature", "Story"]
    setEditedType(validTypes.includes(task.type as TaskType) ? (task.type as TaskType) : "Bug")

    setAssignedTo(task.assigned_to || "")
    setDueDate(task.due_date ? new Date(task.due_date) : null)
  }, [task])

  useEffect(() => {
    const fetchTeamUsers = async () => {
      const { data, error } = await supabase
        .from("team_members_with_email")
        .select("user_id, email")
        .eq("team_id", teamId)

      if (!error && data) {
        setTeamUsers(data.map((u) => ({ id: u.user_id, email: u.email })))
      }
    }

    if (open) fetchTeamUsers()
  }, [teamId, open])

  const handleSave = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: editedTitle,
        type: editedType,
        assigned_to: assignedTo || null,
        due_date: dueDate?.toISOString() ?? null,
      })
      .eq("id", task.id)

    if (error) {
      toast.error("Failed to update task")
    } else {
      toast.success("Task updated")
      onOpenChange(false)
      onSuccess()
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id)

    if (error) {
      toast.error("Failed to delete task")
    } else {
      toast.success("Task deleted")
      onOpenChange(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={editedType} onValueChange={(v) => setEditedType(v as 'Bug' | 'Feature' | 'Story')}>
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

          <div className="space-y-1">
            <Label>Assign to</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {teamUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Due date</Label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="PPP"
              isClearable
              placeholderText="Pick a date"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-6 flex justify-between gap-4">
            <Button
              type="submit"
              onClick={handleSave}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
