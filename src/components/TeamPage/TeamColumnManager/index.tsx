"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { Button } from "@/components/ui/button"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"
import CreateTaskDialog from "../Dialogs/CreateTaskDialog"

import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import EditTaskDialog from "../Dialogs/EditTasksDialog"

type TeamColumnManagerProps = {
  teamId: string
  boardId: string
}

type ColumnProps = {
  id: string
  name: string
  position: number
  board_id: string
}

type TaskProps = {
  id: string
  title: string
  description: string
  column_id: string
  due_date: string | null
  type: string
  priority: string,
  assigned_to: string
}

export default function TeamColumnManager({ teamId, boardId }: TeamColumnManagerProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnProps[]>([])
  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [activeTask, setActiveTask] = useState<TaskProps | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      const { data, error } = await supabase
        .from(TABLE.USER_TEAM)
        .select("role")
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .single()

      if (!error && data?.role === "Admin") {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [teamId])

  const fetchColumns = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLE.COLUMNS)
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true })

    if (!error && data) {
      setColumns(data)
    } else {
      toast.error("Failed to fetch columns")
    }
  }, [boardId])

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("board_id", boardId)

    if (!error && data) {
      setTasks(data)
    } else {
      toast.error("Failed to fetch tasks")
    }
  }, [boardId])

  useEffect(() => {
    fetchColumns()
    fetchTasks()
  }, [fetchColumns, fetchTasks])

  if (!isAdmin) return null

  const handleOpenCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setTaskDialogOpen(true)
  }

  return (
    <div className="w-full p-4 bg-muted rounded">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Board Columns</h2>
        <Button size="sm" onClick={() => setColumnDialogOpen(true)}>
          Manage Columns
        </Button>
      </div>

      <div className="overflow-x-auto pt-2">
        <div className="flex space-x-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-[300px] min-h-screen bg-white rounded shadow p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">{column.name}</h3>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleOpenCreateTask(column.id)}
                >
                  +
                </Button>
              </div>

              <div className="flex flex-col space-y-4">
                {tasks.filter(t => t.column_id === column.id).map(task => (
                  <div
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className="p-4 bg-white text-black rounded shadow cursor-pointer border hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-base">{task.title}</h4>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}

                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.type === "Bug" && (
                        <Badge className="bg-red-100 text-red-600 border border-red-200">
                          Bug
                        </Badge>
                      )}
                      {task.type === "Feature" && (
                        <Badge className="bg-green-100 text-green-700 border border-green-200">
                          Feature
                        </Badge>
                      )}
                      {task.type === "Story" && (
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                          Story
                        </Badge>
                      )}
                    </div>

                    {task.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {format(new Date(task.due_date), "MMM d")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ColumnManagerDialog
        boardId={boardId}
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        onSuccess={fetchColumns}
      />

      {selectedColumnId && (
        <CreateTaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          teamId={teamId}
          boardId={boardId}
          columnId={selectedColumnId}
          onSuccess={fetchTasks}
        />
      )}

      {activeTask && (
        <EditTaskDialog
          teamId={teamId}
          task={activeTask}
          open={!!activeTask}
          onOpenChange={() => setActiveTask(null)}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  )
}
