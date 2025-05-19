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
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken || !refreshToken) {
        setError('Missing token in URL.')
        setLoading(false)
        return
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        console.error('Failed to set session.')
        setError('Failed to set session.')
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        setError('Unable to find user session after setting it.')
        setLoading(false)
        return
      }

      const user = userData.user

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
        console.error('Failed to update team membership status.')
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