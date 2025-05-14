'use client'

import { Suspense } from 'react'
import JoinTeam from '@/views/JoinTeam'

export default function JoinTeamPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <JoinTeam />
    </Suspense>
  )
}