"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SignInBtn } from "@/components/signInBtn"

export default function CTA() {
  const heading = "Ready to get organized?" // maybe pull from props later
  console.log("Rendering CTA...") // can remove this

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-rose-50 border-t border-black/5 relative overflow-hidden">
      <div className="text-center max-w-7xl py-20 px-6 mx-auto">
        <h2 className="tracking-tight font-semibold text-4xl">
        {heading}
        </h2>

        <p className="max-w-2xl mx-auto mt-3 text-slate-600">
          Create a profile for each pet and we’ll keep the rest tidy.
        </p>

        {/* buttons maybe need wrapping later */}
        <div className="justify-center flex mt-7 gap-3 items-center">
          <SignInBtn />
        </div>
      </div>
    </section>
  )
}
