"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { TeamMemberRoles, TeamsTable as Team } from "@/types/supabaseTableData"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames";
import { ROUTES } from "@/constants/routes";


export default function JoinTeamPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()
    
      if (userError || !userData?.user) {
        console.error("No logged-in user found.", userError)
        return
      }
    
      const { data: availableTeams, error: teamError } = await supabase
        .rpc('get_teams_not_joined', { uuser_id: userData.user.id })
    
      if (teamError) {
        console.error("Error fetching teams:", teamError)
        return
      }
    
      setTeams(availableTeams)
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

    const { error } = await supabase.from(TABLE.USER_TEAM).insert([
      { user_id: user.id, team_id: selectedTeam, role: TeamMemberRoles.USER },
    ])

    if (error) {
      console.error("Error joining team:", error)
    } else {
      router.push(ROUTES.TEAM_ID(selectedTeam))
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-xl mx-auto mt-12 p-6 shadow-xl">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Join a Team</h2>
        {teams.length > 0 ? (
          <>
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
          </>
        ) : (
          <p className="text-muted-foreground">No teams available to join.</p>
        )}
      </CardContent>
    </Card>
  )
}