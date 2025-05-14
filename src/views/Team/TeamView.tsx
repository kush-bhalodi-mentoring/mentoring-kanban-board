"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import TeamToolbar from '@/components/TeamPage/TeamToolbar'
import { TeamSwitcher } from "@/components/TeamPage/TeamSwitch/TeamSwitcher"
import TeamBoardManager from "@/components/TeamBoardManager";
import TeamColumnManager from "@/components/TeamPage/TeamColumnManager"

type TeamViewProps = {
  teamId: string;
};

type Team = {
  id: string;
  name: string;
  description: string;
};

export default function TeamView({ teamId }: TeamViewProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [boardId, setBoardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamAndBoard = async () => {
      // Fetch team
      const { data: teamData, error: teamError } = await supabase
        .from(TABLE.TEAMS)
        .select("*")
        .eq("id", teamId)
        .single()

      if (teamError) {
        console.error("Failed to fetch team", teamError)
        setLoading(false)
        return
      }

      setTeam(teamData)

      // Fetch board for the team
      const { data: boardData, error: boardError } = await supabase
        .from(TABLE.BOARDS)
        .select("id")
        .eq("team_id", teamId)
        .single()

      if (boardError) {
        console.error("Failed to fetch board", boardError)
      } else {
        setBoardId(boardData.id)
      }

      setLoading(false)
    }

    fetchTeamAndBoard()
  }, [teamId])

  if (loading) return <div className="p-6">Loading...</div>
  if (!team) return <div className="p-6">Team not found.</div>

  return (
    <div>
      <div className="flex justify-between items-center bg-secondary text-secondary-foreground py-1 px-4 border-b w-full">
        <div className="flex flex-col w-1/2 py-1">
          <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
          <p className="text-sm text-muted-foreground">{team.description}</p>
        </div>
        <div className="flex items-end space-x-2 py-1">
          <TeamSwitcher currentTeamId={teamId} />
          <TeamToolbar
            teamId={teamId}
            initialName={team.name}
            initialDescription={team.description}
            onTeamUpdate={(newName, newDescription) =>
              setTeam((prev) => prev && { ...prev, name: newName, description: newDescription })
            }
          />
        </div>
      </div>

      <div className="space-y-6">
        <TeamBoardManager />
        {boardId && <TeamColumnManager teamId={teamId} boardId={boardId} />}
      </div>
    </div>
  )
}