"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"

type Team = {
  id: string
  name: string
}

export function TeamSwitcher({ currentTeamId }: { currentTeamId: string }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentName, setCurrentName] = useState("Team")
  const router = useRouter()

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data: memberData, error: memberError } = await supabase
        .from("team_members_with_email")
        .select("team_id")
        .eq("user_id", userData.user.id)

      if (memberError) return console.error("Failed to fetch team memberships", memberError)

      const teamIds = (memberData ?? []).map((m: any) => m.team_id)

      if (teamIds.length === 0) {
        return [] // User has joined no teams
      }

      const { data: teamData, error: teamError } = await supabase
      .from(TABLE.TEAMS)
      .select("id, name")
      .in("id", teamIds)

      if (teamError) return console.error("Failed to fetch teams", teamError)

      const teamList = (teamData ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
      }))

      setTeams(teamList)

      const current = teamList.find((t) => t.id === currentTeamId)
      if (current) setCurrentName(current.name)
    }

    fetchTeams()
  }, [currentTeamId])

  const handleSelect = (id: string) => {
    if (id !== currentTeamId) {
      router.push(`${ROUTES.TEAM_ID(id)}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-semibold px-3 py-2 flex items-center gap-1">
          {currentName}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {teams.map((team) => (
          <DropdownMenuItem key={team.id} onClick={() => handleSelect(team.id)}>
            {team.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}