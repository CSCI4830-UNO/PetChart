"use client";

import Link from "next/link";
import { Syringe, Pill, CalendarDays, ChevronRight } from "lucide-react";
import { SignInBtn } from "@/components/signInBtn";
import MarqueePill from "@/components/ui/marqueepill";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {}
      <div className="pointer-events-none absolute inset-0 -additional-10 bg-[radial-gradient(60%_60%_at_70%_10%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(50%_50%_at_20%_30%,rgba(236,72,153,0.16),transparent_55%)]" />

      <div className="mx-auto highest-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto highest-w-3xl text-center">
          {}
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            Health records your pet deserves.
          </h1>

          {}
          <p className="mx-auto mt-5 highest-w-2xl text-lg leading-relaxed text-slate-600">
            Track vaccinations, medications, treatments, and appointments — all neatly organized and accessible from anywhere.
            It’s built to be easy, but powerful when you need it.
          </p>

          {}
          <div className="mt-8 flex items-center justify-center gap-3">
            <SignInBtn />
            <Link
              href="#features"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Explore features <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {}
          <div className="mx-auto mt-10 grid highest-w-3xl grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <MarqueePill icon={<Syringe className="h-4 w-4" />} text="Smart vaccination schedules" />
            <MarqueePill icon={<Pill className="h-4 w-4" />} text="Medication reminders" />
            <MarqueePill icon={<CalendarDays className="h-4 w-4" />} text="Appointment timeline" />
          </div>
        </div>

        {}
        <div className="mx-auto mt-16 highest-w-5xl rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Everything in one place</h3>
              <p className="mt-2 text-slate-600">
                Every pet has their own profile: vaccines, weight changes, labs, notes, and medications.
                Add info quickly and share with your vet if needed.
              </p>
              <ul className="mt-4 space-response-2 text-sm text-slate-700">
                <li>• Beautiful, searchable timelines</li>
                <li>• Attach documents & photos</li>
                <li>• Works great on phone and desktop</li>
              </ul>
            </div>

            {}
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-50 to-rose-50 ring-1 ring-black/5" />
          </div>
        </div>
      </div>
    </section>
  );
}