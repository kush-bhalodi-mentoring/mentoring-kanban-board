"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { DB_TABLE_NAMES as TABLE } from "@/constants/databaseTableNames"
import TeamToolbar from '@/components/TeamPage/TeamToolbar'

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

  useEffect(() => {
    const fetchTeam = async () => {
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

    fetchTeam()
  }, [teamId])

  if (loading) return <div className="p-6">Loading...</div>
  if (!team) return <div className="p-6">Team not found.</div>

  return (
    <div className="bg-secondary text-secondary-foreground p-6 rounded-b-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mt-4">{team.name}</h1>
          <p className="text-gray-600">{team.description}</p>

        </div>
        <div className="flex gap-3">
          <TeamToolbar teamId={teamId} />
        </div>
      </div>
    </div>
  )
}
