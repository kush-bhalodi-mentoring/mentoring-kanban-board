'use client'

import { useParams } from 'next/navigation'
import TeamToolbar from '@/views/Team/TeamToolbar'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function TeamPage() {
  const { teamId } = useParams()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_team')
        .select('role')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .single()

      if (data?.role === 'Admin') {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [teamId])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Team Page: {teamId}</h1>
      {isAdmin && <TeamToolbar teamId={teamId as string} />}
      {/* Rest of your team page UI */}
    </div>
  )
}
