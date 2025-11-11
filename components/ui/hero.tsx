"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MarqueePill from "@/components/ui/marqueepill";
import Image from "next/image";

export default function Hero() {
  return (
    // Title section
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            Health records your pet deserves.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Track vaccinations, medications, treatments, and appointments — beautifully organized
            and available everywhere. Simple to use. Powerful when you need it.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="#features"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Explore features <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Marquee section */}
          {/* can add more if needed if we add more features */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <MarqueePill icon={<Image src="/icons/syringe.svg" alt="Syringe" width={16} height={16} />} text="Vaccination schedules" />
            <MarqueePill icon={<Image src="/icons/pill.svg" alt="Pill" width={16} height={16} />} text="Medication reminders" />
            <MarqueePill icon={<Image src="/icons/calendar.svg" alt="Calendar" width={16} height={16} />} text="Appointment timeline" />
          </div>
        </div>

        {/* Feature row section */}
        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Everything in one place</h3>
              <p className="mt-2 text-slate-600">
                Each pet gets a crisp profile—vaccine history, weight trends, labs, notes, and meds.
                Add records in seconds. Share with your vet when needed.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Beautiful, searchable timelines</li>
                <li>• Attach documents & photos</li>
                <li>• Works great on phone and desktop</li>
              </ul>
            </div>
            <div className="aspect-[4/2] rounded-2xl bg-gradient-to-br from-indigo-50 to-rose-50 ring-1 ring-black/5">
              <Image
                src= "/icons/dashboard-preview.png"
                alt="PetChart dashboard preview"
                width={640}
                height={480}
                className="rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
