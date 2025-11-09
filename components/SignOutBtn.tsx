"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutBtn() {
  const handleSignOut = async () => {
    // Sign out from the app (NextAuth) without redirecting immediately
    await signOut({ redirect: false })
    // Do not open a new tab for Google's logout (prevents account-chooser from opening)
    // Just redirect the user in the same tab after local sign-out. If you need a
    // full Google sign-out as well, consider adding an opt-in setting; for now
    // avoid opening external pages to keep UX simple and avoid popup blocking.
    window.location.href = "/"
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
