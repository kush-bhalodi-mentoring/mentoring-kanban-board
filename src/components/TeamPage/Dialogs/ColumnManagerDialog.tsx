"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { X } from "lucide-react"

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

export default function ColumnManagerDialog({ boardId, open, onOpenChange, onSuccess }: Props) {
  const [columns, setColumns] = useState<Column[]>([])
  const [columnsToDelete, setColumnsToDelete] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load existing columns on open
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true })

      if (error) {
        console.error("Fetch error:", error)
        toast.error("Failed to fetch columns")
        return
      }

      setColumns((data ?? []).map(col => ({
        id: col.id,
        name: col.name,
        boardId: col.board_id,
        position: col.position,
      })))
    }

    if (open) {
      fetch()
      setColumnsToDelete([])
    }
  }, [open, boardId])

  const handleAdd = () => {
    setColumns(prev => [
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
    setColumns(prev => prev.filter((_, i) => i !== index))
    if (!removed.isNew) {
      setColumnsToDelete(prev => [...prev, removed.id])
    }
  }

  const handleSave = async () => {
    setLoading(true)

    const cleaned = columns.filter(col => col.name.trim() !== "")

    // Ensure proper ordering
    const ordered = cleaned.map((col, index) => ({
      ...col,
      position: index + 1,
    }))

    const newCols = ordered.filter(col => col.isNew)
    const existingCols = ordered.filter(col => !col.isNew)

    // INSERT new columns
    if (newCols.length > 0) {
      const insertData = newCols.map(col => ({
        id: col.id || uuidv4(),
        name: col.name,
        board_id: boardId,
        position: col.position,
      }))

      const { error: insertError } = await supabase.from("columns").insert(insertData)

      if (insertError) {
        toast.error("Failed to insert new columns")
        console.error(insertError)
        setLoading(false)
        return
      }
    }

    // UPDATE existing columns
    for (const col of existingCols) {
      const { error: updateError } = await supabase
        .from("columns")
        .update({ name: col.name, position: col.position })
        .eq("id", col.id)

      if (updateError) {
        toast.error("Failed to update columns")
        console.error(updateError)
        setLoading(false)
        return
      }
    }

    // DELETE removed columns
    if (columnsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("columns")
        .delete()
        .in("id", columnsToDelete)

      if (deleteError) {
        toast.error("Failed to delete columns")
        console.error(deleteError)
        setLoading(false)
        return
      }
    }

    toast.success("Columns updated successfully")
    setLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {columns.map((col, i) => (
            <div key={col.id} className="flex items-center gap-2">
              <Input
                placeholder={`Column ${i + 1}`}
                value={col.name}
                onChange={(e) => handleChange(i, e.target.value)}
              />
              <span className="text-muted-foreground text-sm">#{i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => handleRemove(i)}>
                <X className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAdd} variant="outline" size="sm">+ Add Column</Button>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          {loading ? "Saving..." : "Save Columns"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
