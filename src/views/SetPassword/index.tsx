"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import SetPasswordForm from "@/components/SetPasswordForm"
import { ROUTES } from "@/constants/routes"

export default function SetPasswordView() {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const router = useRouter()

  const teamId = searchParams.get("teamId")
  const userId = searchParams.get("userId")

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    setToken(hashParams.get("access_token"))
    setRefreshToken(hashParams.get("refresh_token"))
  }, [])

  const handleSetPassword = async (
    password: string,
    confirmPassword: string,
    setError: (msg: string) => void,
    setSuccess: (v: boolean) => void,
    setLoading: (v: boolean) => void
  ) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 10 characters, with a capital letter, lowercase letter, and special character")
      return
    }

    if (!token || !refreshToken) {
      setError("Invalid or missing token")
      return
    }

    setLoading(true)

    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      })
      if (sessionError) throw sessionError

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const email = user?.email
      if (!email) throw new Error("Email not found")

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      const { data: { session: postUpdateSession } } = await supabase.auth.getSession()
      if (!postUpdateSession) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }

      if (userId && teamId) {
        const response = await fetch(`/api/auth/accept-invite?userId=${userId}&teamId=${teamId}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to accept team invite")
        }
      }

      setSuccess(true)

      if (teamId) {
        router.push(ROUTES.TEAM_ID(teamId))
      } else {
        router.push(ROUTES.LOGIN)
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Failed to set password")
    } finally {
      setLoading(false)
    }
  }

  return <SetPasswordForm onSetPassword={handleSetPassword} />
}