"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
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
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [taskType, setTaskType] = useState<string>("Task")
  const [position, setPosition] = useState<number>(1)
  const [teamUsers, setTeamUsers] = useState<{ id: string, email: string }[]>([])

  type TeamUser = {
    user_id: string
    email: string
  }

  useEffect(() => {
    const fetchTeamUsers = async () => {
  const { data, error } = await supabase
    .from("team_members_with_email")
    .select("user_id, email")
    .eq("team_id", teamId) as {
      data: TeamUser[] | null;
      error: Error | null;
    }

  if (!error && data) {
    setTeamUsers(data.map((u) => ({ id: u.user_id, email: u.email })))
  }
}

    fetchTeamUsers()
  }, [teamId])

  const handleSubmit = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return toast.error("Not authenticated")

    const { error } = await supabase.from("tasks").insert({
      id: uuidv4(),
      title,
      description,
      column_id: columnId,
      board_id: boardId,
      team_id: teamId,
      position,
      created_by: user.id,
      assigned_to: assignedTo || null,
      due_date: dueDate ? dueDate.toISOString() : null,
      type: taskType,
      parent: null,
      sprint_id: null,
    })

    if (error) {
      toast.error("Failed to create task")
    } else {
      toast.success("Task created")
      onSuccess()
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDueDate(null)
    setAssignedTo("")
    setTaskType("Task")
    setPosition(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value))}
              className="w-1/2"
            />

            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Task Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Story">Story</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Assign to" />
            </SelectTrigger>
            <SelectContent>
              {teamUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker date={dueDate} onDateChange={setDueDate} />

          <Button onClick={handleSubmit} className="w-full">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
