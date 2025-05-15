"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Boards } from "@/types/supabaseTableData"

const BoardSchema = z.object({
  name: z.string().min(3, "Board name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
})

type BoardFormData = z.infer<typeof BoardSchema>

export default function TeamBoardManager() {
  const { teamId } = useParams<{ teamId: string }>()
  const [board, setBoard] = useState<Boards | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const form = useForm<BoardFormData>({
    resolver: zodResolver(BoardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("User not authenticated")
        return
      }

      const { data: userTeam, error: userTeamError } = await supabase
        .from("user_team")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (userTeamError) {
        toast.error("Could not verify team role")
        return
      }

      setIsAdmin(userTeam?.role === "Admin")

      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("*")
        .eq("team_id", teamId)
        .single()

      if (boardError && boardError.code !== "PGRST116") {
        toast.error("Failed to fetch board")
      } else {
        setBoard(boardData)
      }

      setLoading(false)
    }

    fetchData()
  }, [teamId])

  const handleCreateBoard = async (data: BoardFormData) => {
    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      toast.error("User not authenticated")
      return
    }

    const { error } = await supabase.from("boards").insert([
      {
        team_id: teamId,
        name: data.name,
        description: data.description,
        created_by: userData.user.id,
      },
    ])

    if (error) {
      toast.error("Failed to create board")
    } else {
      toast.success("Board created!")
      setBoard({
        id: "",
        team_id: teamId,
        name: data.name,
        description: data.description,
        created_by: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (loading) return <p>Loading board info...</p>

  return (
    <Card className="w-full text-left rounded-none">
      <CardContent className="px-4 space-y-4">
        {board ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">{board.name}</h2>
          </div>
        ) : isAdmin ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateBoard)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Name</FormLabel>
                    <FormControl>
                      <Input className="w-1/3" placeholder="Team Roadmap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input className="w-1/3" placeholder="Project planning and task board" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-1/3">
                Create Board
              </Button>
            </form>
          </Form>
        ) : (
          <p className="text-muted-foreground">No board has been created for this team yet.</p>
        )}
      </CardContent>
    </Card>
  )
}