"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutBtn() {
  const handleSignOut = async () => {

    await signOut({ redirect: false })

    window.location.href = "/"
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
