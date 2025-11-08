"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutBtn() {
  const handleSignOut = async () => {
    // Sign out from the app (NextAuth) without redirecting immediately
    await signOut({ redirect: false })

    // Open Google's logout page in a new tab to sign the user out of Google services
    // This cannot be done via fetch due to cross-origin policies, so we open a new tab/window.
    try {
      window.open("https://accounts.google.com/Logout", "_blank", "noopener,noreferrer")
    } catch (e) {
      // ignore if popup is blocked; the local sign-out already occurred
      console.warn("Could not open Google logout page", e)
    }

    // Finally redirect the user back to the homepage (or change as desired)
    window.location.href = "/"
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
