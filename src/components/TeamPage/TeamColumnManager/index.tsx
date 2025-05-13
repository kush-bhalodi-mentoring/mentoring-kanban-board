"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import { Button } from "@/components/ui/button"
import ColumnManagerDialog from "@/components/TeamPage/Dialogs/ColumnManagerDialog"

type TeamColumnManagerProps = {
  teamId: string
  boardId: string
}

export default function TeamColumnManager({ teamId, boardId }: TeamColumnManagerProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [columns, setColumns] = useState<any[]>([])

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

  const fetchColumns = async () => {
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
  }

  useEffect(() => {
    fetchColumns()
  }, [boardId])

  if (!isAdmin) return null

  return (
    <div className="p-4 border rounded bg-muted">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Columns</h2>
        <Button size="sm" onClick={() => setColumnDialogOpen(true)}>
          Manage Columns
        </Button>
      </div>

      <ul className="mt-4 space-y-1">
        {columns.map((column) => (
          <li key={column.id} className="text-sm">
            {column.name}
          </li>
        ))}
      </ul>

      <ColumnManagerDialog
        boardId={boardId}
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        onSuccess={fetchColumns}
      />
    </div>
  )
}
