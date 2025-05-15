'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KanbanSquare, LogIn, LogOut, UserPlus, Users } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

type Team = {
  id: string
  name: string
}

type User = {
  id: string
  email: string | null
}

type Props = {
  user: User | null
  teams: Team[]
  loading: boolean
}

export default function HomePage({ user, teams, loading }: Props) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-muted">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-muted">
      <Card className="w-full max-w-xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <KanbanSquare className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold">Welcome to our project</CardTitle>
          <p className="text-muted-foreground text-sm">
            Lightweight, collaborative Kanban Boards for teams.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-6">
          {!user ? (
            <>
              <Button asChild size="lg" className="w-full">
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" /> Log In
                </Link>
              </Button>

              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="/signup">
                  <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="w-full">
                <Link href="/team/join">
                  <Users className="mr-2 h-5 w-5" /> Create/Join a Team
                </Link>
              </Button>

              {teams.length > 0 ? (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Your Teams</h2>
                  <ul className="space-y-2">
                    {teams.map((team) => (
                      <li key={team.id}>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href={`/team/${team.id}`}>{team.name}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">You’re not part of any teams yet.</p>
              )}

              <Button
                onClick={handleLogout}
                className="w-full mt-4 bg-black text-white hover:bg-gray-900"
              >
                <LogOut className="mr-2 h-5 w-5" /> Log Out
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}