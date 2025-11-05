"use client"

import { signIn } from "next-auth/react"

export function SignInBtn() {
    return (
        <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 my-6 border border-gray-400 rounded shadow" onClick={() => signIn("google")}>
            Sign In
        </button>
    )
}