"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { Button } from "@/components/ui/button"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"
import CreateTaskDialog from "../Dialogs/CreateTaskDialog"
import { toast } from "sonner"
import EditTaskDialog from "@/components/TeamPage/Dialogs/EditTasksDialog"
import TaskCard from "@/components/TeamPage/TaskCard"


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

type TaskType = "Bug" | "Feature" | "Story"

type TaskProps = {
  id: string
  title: string
  description: string | null
  column_id: string
  due_date: string | null
  type: TaskType         // <- changed from string to TaskType
  position: number
  assigned_to: string
  estimation?: number
  created_by: string
}

export default function TeamColumnManager({ teamId, boardId }: TeamColumnManagerProps) {
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnProps[]>([])
  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [activeTask, setActiveTask] = useState<TaskProps | null>(null)

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
                {tasks
                  .filter(t => t.column_id === column.id)
                  .map(task => (
                    <TaskCard
                      key={task.id}
                      task={{
                        ...task,
                        type: task.type as TaskType
                      }}
                      teamId={teamId}
                      open={!!activeTask && activeTask.id === task.id}
                      onOpenChange={() => setActiveTask(null)}
                      onSuccess={() => {
                        setActiveTask(task)
                      }}
                    />
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

