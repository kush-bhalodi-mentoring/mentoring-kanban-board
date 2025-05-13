// /src/app/components/TeamPage/Dialogs/ColumnManagerDialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useState } from "react"
import { supabase } from "@/utils/supabase/client"

type Column = {
  id: string
  name: string
  boardId: string
  position: number
}

type Props = {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ColumnManagerDialog({ boardId, open, onOpenChange, onSuccess }: Props) {
  const [columns, setColumns] = useState<Column[]>([
    { id: uuidv4(), name: "", boardId, position: 1},
  ])
  const [loading, setLoading] = useState(false)

  const handleAdd = () => {
    setColumns(prev => [...prev, { id: uuidv4(), name: "", position: prev.length + 1, boardId }])
  }

  const handleChange = (index: number, value: string) => {
    const updated = [...columns]
    updated[index].name = value
    setColumns(updated)
  }

  const handleSave = async () => {
  setLoading(true)
  const formatted = columns.map(col => ({
    id: col.id,
    name: col.name,
    board_id: col.boardId,
    position: col.position
  }))

  const { error } = await supabase.from("columns").insert(formatted)
  setLoading(false)

  if (error) {
    console.error("Insert error:", error)
    toast.error("Failed to save columns")
    return
  }

  toast.success("Columns saved successfully")
  onOpenChange(false)
  onSuccess()
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Board Columns</DialogTitle>
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
