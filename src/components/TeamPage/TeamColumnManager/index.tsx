"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { Button } from "@/components/ui/button"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"
import CreateTaskDialog from "../Dialogs/CreateTaskDialog"
import { toast } from "sonner"
import EditTaskDialog from "@/components/TeamPage/Dialogs/EditTasksDialog"
// import TaskCard from "@/components/TeamPage/TaskCard"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import SortableTaskCard from "../SortableTaskCard" 


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

export type TaskProps = {
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnProps[]>([])
  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [activeTask, setActiveTask] = useState<TaskProps | null>(null)
  const sensors = useSensors(useSensor(PointerSensor))

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


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTask = tasks.find(task => task.id === active.id)
    const overTask = tasks.find(task => task.id === over.id)

    if (!activeTask || !overTask) return

    // Check if they are in the same column
    const isSameColumn = activeTask.column_id === overTask.column_id
    const columnTasks = tasks
      .filter(t => t.column_id === activeTask.column_id)
      .sort((a, b) => a.position - b.position)

    const oldIndex = columnTasks.findIndex(t => t.id === active.id)
    const newIndex = columnTasks.findIndex(t => t.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(columnTasks, oldIndex, newIndex)

    // Update positions locally
    const updatedTasks = tasks.map(task => {
      const reorderedTask = reordered.find(t => t.id === task.id)
      return reorderedTask
        ? { ...task, position: reordered.indexOf(reorderedTask) }
        : task
    })

    setTasks(updatedTasks)

    // Persist changes to Supabase
    for (let i = 0; i < reordered.length; i++) {
      const task = reordered[i]
      await supabase
        .from("tasks")
        .update({ position: i })
        .eq("id", task.id)
    }
  }
  
  return (
    <div className="w-full p-4 bg-muted rounded">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Board Columns</h2>
          <Button size="sm" onClick={() => setColumnDialogOpen(true)}>
            Manage Columns
          </Button>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="flex space-x-4 min-w-max">
            {columns.map((column) => {
              const columnTasks = tasks
                .filter((t) => t.column_id === column.id)
                .sort((a, b) => a.position - b.position)

              return (
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

                  <SortableContext
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col space-y-4">
                      {columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          teamId={teamId}
                          open={!!activeTask && activeTask.id === task.id}
                          onOpenChange={() => setActiveTask(null)}
                          onSuccess={() => setActiveTask(task)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>
        </div>
      </DndContext>

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
