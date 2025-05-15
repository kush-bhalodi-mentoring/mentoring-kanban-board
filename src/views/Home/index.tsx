'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import HomePage from '@/components/HomePage'

type Team = {
  id: string
  name: string
}

type User = {
  id: string
  email: string | null
}

type UserTeamWithTeam = {
  team_id: string
  teams: { name: string | null } | null
}

export default function HomeView() {
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndTeams = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error fetching session:', sessionError)
        setLoading(false)
        return
      }

      if (!session) {
        console.log('No session found')
        setUser(null)
        setLoading(false)
        return
      }

      const currentUser = session.user

      setUser({
        id: currentUser.id,
        email: currentUser.email ?? null,
      })

      const { data, error } = await supabase
        .from('user_team')
        .select(
          `
          team_id,
          teams (
            name
          )
        `
        )
        .eq('user_id', currentUser.id)

      if (error) {
        console.error('Error fetching teams:', error)
      } else if (data) {
        const formattedTeams = (data as unknown as UserTeamWithTeam[]).map((entry) => ({
          id: entry.team_id,
          name: entry.teams?.name || 'Unnamed Team',
        }))

        setTeams(formattedTeams)
      }

      setLoading(false)
    }

    fetchUserAndTeams()
  }, [])

  return <HomePage user={user} teams={teams} loading={loading} />
}