"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function JoinTeamPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      toast.error("User not found")
      setLoading(false)
      return
    }

    const userId = userData.user.id

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert([{ name, description }])
      .select("id")
      .single()

    if (teamError || !team) {
      toast.error("Failed to create team")
      setLoading(false)
      return
    }

    const teamId = team.id

    const { error: userTeamError } = await supabase
      .from("user_team")
      .insert([{ user_id: userId, team_id: teamId, role: "Admin" }])

    if (userTeamError) {
      toast.error("Failed to associate user with team")
      setLoading(false)
      return
    }

    toast.success("Team created successfully!")
    router.push(`/team/${teamId}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 space-y-8">
      {/* Intro Card */}
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-2">Create/Join a team</h1>
          <p className="text-muted-foreground">
            Please create or join a team to continue to the board.
          </p>
        </CardContent>
      </Card>

      {/* Create Team Form */}
      <Card className="w-full max-w-md text-left">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Create a Team</h2>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}