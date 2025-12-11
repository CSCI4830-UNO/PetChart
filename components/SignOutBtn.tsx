"use client"

import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

export default function SignOutBtn() {
  const handleSignOut = async () => {

    await signOut({ redirect: false })

    window.location.href = "/"
  }

  return (
    <Button className="bg-white dark:bg-[#242526] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-400 dark:border-[#3a3b3c] rounded shadow" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}