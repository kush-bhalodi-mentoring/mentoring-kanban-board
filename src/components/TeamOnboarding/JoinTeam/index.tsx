// src/app/team/join/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type Team = {
  id: string
  name: string
  description: string
}

export default function JoinTeamPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from("teams").select("*")
      if (error) console.error("Error fetching teams:", error)
      else setTeams(data)
    }

    fetchTeams()
  }, [])

  const handleJoinTeam = async () => {
    if (!selectedTeam) return

    setLoading(true)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("No logged-in user found.")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("user_team").insert([
      { user_id: user.id, team_id: selectedTeam },
    ])

    if (error) {
      console.error("Error joining team:", error)
    } else {
      router.push(`/team/${selectedTeam}`)
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-xl mx-auto mt-12 p-6 shadow-xl">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Join a Team</h2>
        <RadioGroup onValueChange={setSelectedTeam}>
          {teams.map((team) => (
            <div key={team.id} className="flex items-start space-x-2">
              <RadioGroupItem value={team.id} id={team.id} />
              <div>
                <Label htmlFor={team.id} className="font-medium">
                  {team.name}
                </Label>
                <p className="text-sm text-gray-600">{team.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        <Button
          onClick={handleJoinTeam}
          disabled={!selectedTeam || loading}
          className="mt-4"
        >
          {loading ? "Joining..." : "Join Team"}
        </Button>
      </CardContent>
    </Card>
  )
}
