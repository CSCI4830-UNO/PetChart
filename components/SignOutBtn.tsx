"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutBtn() {
  const handleSignOut = async () => {

    await signOut({ redirect: false })

    window.location.href = "/"
  }

  return (
    <Button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}