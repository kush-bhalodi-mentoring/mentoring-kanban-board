"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

type Team = {
  id: string
  name: string
  description: string
}

export default function JoinTeamPage() {
  const [mode, setMode] = useState<"create" | "join">("create")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (mode === "join") {
      const fetchTeams = async () => {
        const { data, error } = await supabase.from("teams").select("*")
        if (error) toast.error("Failed to load teams")
        else setTeams(data)
      }
      fetchTeams()
    }
  }, [mode])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      toast.error("User not found")
      setLoading(false)
      return
    }

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

    const { error: userTeamError } = await supabase
      .from("user_team")
      .insert([{ user_id: userData.user.id, team_id: team.id, role: "Admin" }])

    if (userTeamError) {
      toast.error("Failed to link user to team")
      setLoading(false)
      return
    }

    toast.success("Team created!")
    router.push(`/team/${team.id}`)
    setLoading(false)
  }

  const handleJoinTeam = async () => {
    if (!selectedTeam) return
    setLoading(true)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      toast.error("User not found")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from("user_team")
      .insert([{ user_id: user.id, team_id: selectedTeam }])

    if (insertError) {
      toast.error("Failed to join team")
      setLoading(false)
      return
    }

    toast.success("Joined team!")
    router.push(`/team/${selectedTeam}`)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 space-y-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-3xl font-bold">Create or Join a Team</h1>
          <div className="flex justify-center space-x-4">
            <Button
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
            >
              Create
            </Button>
            <Button
              variant={mode === "join" ? "default" : "outline"}
              onClick={() => setMode("join")}
            >
              Join
            </Button>
          </div>
        </CardContent>
      </Card>

      {mode === "create" && (
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Create a Team</h2>
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
      )}

      {mode === "join" && (
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Select a Team</h2>
            <RadioGroup onValueChange={setSelectedTeam} className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={team.id} id={team.id} />
                  <div>
                    <Label htmlFor={team.id} className="font-medium">
                      {team.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {team.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleJoinTeam}
              disabled={!selectedTeam || loading}
              className="w-full"
            >
              {loading ? "Joining..." : "Join Team"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
