import { Suspense } from "react"
import SetPasswordView from "@/views/SetPassword"

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordView />
    </Suspense>
  )
}