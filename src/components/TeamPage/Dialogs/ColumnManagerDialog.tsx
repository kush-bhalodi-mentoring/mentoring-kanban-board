"use client"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { X, GripVertical } from "lucide-react"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"

type Column = {
  id: string
  name: string
  boardId: string
  position: number
  isNew?: boolean
}

type Props = {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Sortable column with drag handle
function SortableItem({
  column,
  index,
  handleChange,
  handleRemove,
}: {
  column: Column
  index: number
  handleChange: (index: number, value: string) => void
  handleRemove: (index: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-muted p-2 rounded"
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-grab"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Column input */}
      <Input
        placeholder={`Column ${index + 1}`}
        value={column.name}
        onChange={(e) => handleChange(index, e.target.value)}
      />

      <span className="text-muted-foreground text-sm">#{index + 1}</span>

      <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
        <X className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  )
}

export default function ColumnManagerDialog({ boardId, open, onOpenChange, onSuccess }: Props) {
  const [columns, setColumns] = useState<Column[]>([])
  const [columnsToDelete, setColumnsToDelete] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    const DEFAULT_COLUMNS = [
      { id: uuidv4(), name: "To Do", position: 0, boardId },
      { id: uuidv4(), name: "In Progress", position: 1, boardId },
      { id: uuidv4(), name: "Done", position: 2, boardId },
    ]
    const fetchColumns = async () => {
      const { data } = await supabase
        .from(TABLE.COLUMNS)
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true })

      if (data && data.length > 0) {
        setColumns(data)
      } else {
        setColumns(DEFAULT_COLUMNS)
      }
    }

    if (open) fetchColumns()
  }, [open, boardId])

  const handleAdd = () => {
    setColumns((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: "",
        boardId,
        position: prev.length + 1,
        isNew: true,
      },
    ])
  }

  const handleChange = (index: number, value: string) => {
    const updated = [...columns]
    updated[index].name = value
    setColumns(updated)
  }

  const handleRemove = (index: number) => {
    const removed = columns[index]
    setColumns((prev) => prev.filter((_, i) => i !== index))
    if (!removed.isNew) {
      setColumnsToDelete((prev) => [...prev, removed.id])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = columns.findIndex((col) => col.id === active.id)
    const newIndex = columns.findIndex((col) => col.id === over.id)

    setColumns((prev) => arrayMove(prev, oldIndex, newIndex))
  }
  

  const cleanAndOrderColumns = (columns: Column[]) => {
  const cleaned = columns.filter((col) => col.name.trim() !== "")
  return cleaned.map((col, index) => ({
    ...col,
    position: index + 1,
  }))
}

const insertNewColumns = async (columns: Column[], boardId: string) => {
  const insertData = columns.map((col) => ({
    id: col.id || uuidv4(),
    name: col.name,
    board_id: boardId,
    position: col.position,
  }))
  const { error } = await supabase.from("columns").insert(insertData)
  if (error) throw new Error("Failed to insert new columns")
}

const updateExistingColumns = async (columns: Column[]) => {
  for (const col of columns) {
    const { error } = await supabase
      .from("columns")
      .update({ name: col.name, position: col.position })
      .eq("id", col.id)
    if (error) throw new Error("Failed to update columns")
  }
}

const deleteColumns = async (ids: string[]) => {
  const { error } = await supabase.from("columns").delete().in("id", ids)
  if (error) throw new Error("Failed to delete columns")
}

const handleSave = async () => {
  setLoading(true)
  try {
    const ordered = cleanAndOrderColumns(columns)

    const newCols = ordered.filter((col) => col.isNew)
    const existingCols = ordered.filter((col) => !col.isNew)

    if (newCols.length > 0) {
      await insertNewColumns(newCols, boardId)
    }

    if (existingCols.length > 0) {
      await updateExistingColumns(existingCols)
    }

    if (columnsToDelete.length > 0) {
      await deleteColumns(columnsToDelete)
    }

    toast.success("Columns updated successfully")
    onOpenChange(false)
    onSuccess()
  } catch (error) {
    console.error(error)
    toast.error((error as Error).message || "An error occurred")
  } finally {
    setLoading(false)
  }
}


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columns.map((col) => col.id)} strategy={verticalListSortingStrategy}>
              {columns.map((col, i) => (
                <SortableItem
                  key={col.id}
                  column={col}
                  index={i}
                  handleChange={handleChange}
                  handleRemove={handleRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button onClick={handleAdd} variant="outline" size="sm">
            + Add Column
          </Button>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          {loading ? "Saving..." : "Save Columns"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
