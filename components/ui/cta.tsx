"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SignInBtn } from "@/components/signInBtn"

export default function CTA() {
  const heading = "Ready to get organized?" // maybe pull from props later
  console.log("Rendering CTA...") // can remove this

  return (
    <section className="bg-gradient-to-br from-indigo-50 dark:from-[#242526] via-white dark:via-[#18191a] to-rose-50 dark:to-[#242526] border-t border-black/5 dark:border-[#3a3b3c] relative overflow-hidden">
      <div className="text-center max-w-7xl py-20 px-6 mx-auto">
        <h2 className="tracking-tight font-semibold text-4xl text-slate-900 dark:text-white">
        {heading}
        </h2>

        <p className="max-w-2xl mx-auto mt-3 text-slate-600 dark:text-slate-400">
          Create a profile for each pet and we'll keep the rest tidy.
        </p>

        {/* buttons maybe need wrapping later */}
        <div className="justify-center flex mt-7 gap-3 items-center">
          <SignInBtn />
        </div>
      </div>
    </section>
  )
}
