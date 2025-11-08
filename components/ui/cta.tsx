"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SignInBtn } from "@/components/signInBtn";

export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-4xl font-semibold tracking-tight">Ready to get organized?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Create a profile for each pet and we’ll keep the rest tidy.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <SignInBtn />
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            See a demo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
