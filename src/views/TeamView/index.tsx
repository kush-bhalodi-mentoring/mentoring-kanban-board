"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import TeamToolbar from "@/components/TeamPage/TeamToolbar"
import { TeamSwitcher } from "@/components/TeamPage/TeamSwitch/TeamSwitcher"
import TeamBoardManager from "@/components/TeamBoardManager"
import { toast } from "sonner"
import { KanbanSquare } from "lucide-react"
import { ROUTES } from "@/constants/routes"

type TeamViewProps = {
  teamId: string
}

type Team = {
  id: string
  name: string
  description: string
}

export default function TeamView({ teamId }: TeamViewProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("Unable to find user session.")
        router.replace(ROUTES.HOME)
        return
      }

      const { data: userTeam, error: userTeamError } = await supabase
        .from("user_team")
        .select("status")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (userTeamError || !userTeam || userTeam.status !== "ACTIVE") {
        toast.error("No access to this team.")
        router.replace(ROUTES.HOME)
        return
      }

      const { data, error } = await supabase
        .from(TABLE.TEAMS)
        .select("*")
        .eq("id", teamId)
        .single()

      if (error) {
        console.error("Failed to fetch team", error)
      } else {
        setTeam(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [teamId, router])

  if (loading) return <div className="p-6">Loading...</div>
  if (!team) return <div className="p-6">Team not found.</div>

  return (
    <div>
      <div className="flex justify-between items-center bg-secondary text-secondary-foreground py-1 px-4 border-b w-full">
        <div className="flex items-center space-x-3 w-1/2 py-1">
          <Link href={ROUTES.HOME} className="text-primary hover:opacity-80 transition">
            <KanbanSquare className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </div>
        </div>

        <div className="flex items-end space-x-2 py-1">
          <TeamSwitcher currentTeamId={teamId} />
          <TeamToolbar
            teamId={teamId}
            initialName={team.name}
            initialDescription={team.description}
            onTeamUpdate={(newName, newDescription) =>
              setTeam((prev) =>
                prev ? { ...prev, name: newName, description: newDescription } : prev
              )
            }
          />
        </div>
      </div>

      <div className="space-y-6">
        <TeamBoardManager />
      </div>
    </div>
  )
}