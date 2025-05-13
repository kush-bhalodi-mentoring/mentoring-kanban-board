"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { Button } from "@/components/ui/button"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"

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

export default function TeamColumnManager({ teamId, boardId }: TeamColumnManagerProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [columns, setColumns] = useState<ColumnProps[]>([])

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
      console.error("Failed to fetch columns", error)
    }
  }, [boardId])

  useEffect(() => {
    fetchColumns()
  }, [boardId, fetchColumns])

  if (!isAdmin) return null

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
              className="w-[300px] min-h-screen bg-white rounded shadow p-4"
            >
              <h3 className="text-sm font-semibold mb-2">{column.name}</h3>
              <div className="flex-1 text-xs text-muted-foreground italic">
                No tasks
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
    </div>
  )
}
