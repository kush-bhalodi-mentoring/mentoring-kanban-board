'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { ROUTES } from '@/constants/routes'

export default function JoinTeam() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const activateAndRedirect = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Unable to find user session.')
        setLoading(false)
        return
      }

      if (!teamId) {
        setError('Missing team information.')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('user_team')
        .update({ status: 'ACTIVE' })
        .eq('user_id', user.id)
        .eq('team_id', teamId)

      if (updateError) {
        setError('Failed to join team.')
        setLoading(false)
        return
      }

      router.replace(ROUTES.TEAM_ID(teamId))
    }

    activateAndRedirect()
  }, [teamId, router])

  if (loading) return <p>Joining your team…</p>
  if (error) return <p>Error: {error}</p>

  return null
}