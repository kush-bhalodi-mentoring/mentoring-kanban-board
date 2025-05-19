"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"
import DatePicker from "react-datepicker"
import { Editor } from "@tinymce/tinymce-react"
import type { Editor as TinyMCEEditor } from "tinymce"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import "react-datepicker/dist/react-datepicker.css"

type Props = {
  task: {
    id: string
    title: string
    description: string | null
    type: string
    assigned_to: string | null
    due_date?: string | null
    position: number
    estimation?: number
    created_by: string
    column_id: string 
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  teamId: string
  boardId: string
}

type TaskType = 'Bug' | 'Feature' | 'Story'



export default function EditTaskDialog({ 
  task, 
  open, 
  onOpenChange, 
  onSuccess, 
  teamId, 
  boardId 
}: Props) {
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const defaultType: TaskType = ['Bug', 'Feature', 'Story'].includes(task.type as TaskType)
    ? (task.type as TaskType)
    : 'Bug'
  const [editedType, setEditedType] = useState<TaskType>(defaultType)
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "")
  const [dueDate, setDueDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date) : null
  )
  const [teamUsers, setTeamUsers] = useState<{ id: string; email: string }[]>([])
  const [description, setDescription] = useState(task.description || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const [columnId, setColumnId] = useState(task.column_id)
  const [columns, setColumns] = useState<{ id: string; name: string }[]>([])

  
  useEffect(() => {
    const fetchColumns = async () => {
      const { data, error } = await supabase
        .from(TABLE.COLUMNS)
        .select("id, name")
        .eq("board_id", boardId)

      if (!error && data) {
        setColumns(data)
      }
    }

    if (open) fetchColumns()
  }, [boardId, open])

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
        description: description,
        type: editedType,
        assigned_to: assignedTo || null,
        due_date: dueDate?.toISOString() ?? null,
        column_id: columnId, 
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
      <DialogTitle></DialogTitle>
      <DialogContent className="w-full min-w-250">
        <div className="mb-4">
          {!isEditingTitle ? (
            <h2
              className="text-2xl font-bold hover:underline cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              {editedTitle || "Untitled Task"}
            </h2>
          ) : (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              placeholder="Task title"
              className="text-2xl font-bold"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-6">
          <div>
            <div className="space-y-1">
              {!isEditingDescription ? (
                <div
                  className="min-h-[300px] rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
                  onClick={() => setIsEditingDescription(true)}
                  dangerouslySetInnerHTML={{
                    __html:
                      description?.trim()?.length > 0
                        ? description
                        : "<span class='text-muted-foreground italic'>Click to add description...</span>",
                  }}
                />
              ) : (
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_EDITOR_API_KEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  value={description}
                  
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: ["link", "lists", "autolink"],
                    toolbar: "undo redo | bold italic | bullist numlist | link",
                    placeholder: "Add a description...",
                    content_style:
                      "body { font-family: sans-serif; font-size: 14px; padding: 8px; }",
                  }}
                  onEditorChange={(content) => setDescription(content)}
                  onBlur={() => {
                    setIsEditingDescription(false)
                    setDescription(editorRef.current?.getContent() || "")
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Type</p>
              <Select
                value={editedType}
                onValueChange={(v) => setEditedType(v as TaskType)}
              >
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

            <div>
              <p className="text-sm font-medium mb-1">Assign to</p>
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

            <div>
              <p className="text-sm font-medium mb-1">Due date</p>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="PPP"
                isClearable
                placeholderText="Pick a date"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Column</p>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
