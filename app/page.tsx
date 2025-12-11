"use client";

import SignOutBtn from "@/components/SignOutBtn";
import { PetCard } from "@/components/PetCard";
import { AddPetCard } from "@/components/AddPetCard";
import { Heart, ChevronDown, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePets } from "@/hooks/usePets";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

// Marketing stuff
import NavBar from "@/components/ui/navbar";
import Hero from "@/components/ui/hero";
import FeatureRow from "@/components/ui/featurerow";
import PrivacyCard from "@/components/ui/privacycard";
import CTA from "@/components/ui/cta";
import Footer from "@/components/ui/footer";

// Animations
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: userSession } = useSession();
  const router = useRouter();
  const { pets, loading } = usePets(); // might add error later
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const motionGroup = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, duration: 0.3 }
    }
  };

  const fadeInUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, delay }
    }
  });

  // ---------- Not signed in: Marketing Site ----------
  if (!userSession?.user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 antialiased">
        <NavBar />

        <motion.main initial="hidden" animate="show" variants={motionGroup}>
          <motion.div variants={fadeInUp(0.1)}>
            <Hero />
          </motion.div>

          <motion.section
            id="features"
            className="mx-auto max-w-7xl px-6 py-20"
            variants={fadeInUp(0.15)}
          >
            {/* Feature rows */}
            {/* You can add more / edit the images and cards here */}
            <motion.div variants={fadeInUp(0.18)}>
              <FeatureRow
                image="/icons/schedule.png"
                kicker="Vaccinations"
                title="Never miss a booster again."
                subhead="Auto schedules by species & age. Clear statuses: due, upcoming, overdue."
                bulletA="Set a date, get reminders"
                bulletB="Shareable records"
              />
            </motion.div>

            <motion.div variants={fadeInUp(0.22)}>
              <FeatureRow
                image="/icons/medication.png"
                kicker="Medications"
                title="Reminders that actually help."
                subhead="Plan monthly or short-term meds, and log doses easily."
                bulletA="Dosage tracking"
                bulletB="Attachments + refill n"
                imageLeft
              />
            </motion.div>

            <motion.div variants={fadeInUp(0.26)}>
              <FeatureRow
              image="/icons/appointments.png"
                kicker="Appointments"
                title="A timeline you can trust."
                subhead="Wellness checks, labs, and procedures—all trackable & searchable."
                bulletA="Vet visit logs"
                bulletB="Upcoming appointment reminders"
              />
            </motion.div>
          </motion.section>

          {/* Privacy card */}
          <motion.div variants={fadeInUp(0.3)}>
            <PrivacyCard />
          </motion.div>
          <motion.div variants={fadeInUp(0.35)}>
            <CTA />
          </motion.div>
          <Footer />
        </motion.main>
      </div>
    );
  }

  // ---------- Signed in: Dashboard ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="sticky top-0 z-40 border-b border-gray-100/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                <Image src="/icons/favicon.ico" alt="Icon" width={100} height={100} />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">PetChart</h1>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Welcome</p>
                <p className="text-sm font-medium text-gray-900">
                  {userSession.user?.name}
                </p>
              </div>
              {/* User avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative inline-flex items-center gap-1 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  {userSession.user?.image && (
                    <Image
                      src={userSession.user.image}
                      alt={userSession.user.name || "User avatar"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full ring-2 ring-gray-100 cursor-pointer"
                    />
                  )}
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {userSession.user?.image && (
                          <Image
                            src={userSession.user.image}
                            alt={userSession.user.name || "User avatar"}
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-full border-2 border-white shadow-sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{userSession.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{userSession.user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200"></div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/settings");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <Settings size={18} className="text-gray-700" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </button>

                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await signOut({ redirect: false });
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <LogOut size={18} className="text-gray-700" />
                        </div>
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-12">

          {/* Hero section */}
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
              Your Pet Family
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              All their records, in one place. Keep track of vaccinations, medications, appointments, and more with ease.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative rounded-2xl bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100/50 p-6 transition-all hover:border-blue-200/50">
              <div className="text-4xl font-bold text-blue-600">
                {loading ? "..." : pets.length}
              </div>
              <div className="text-sm text-gray-600 mt-2">Total Pets</div>
            </div>
            <div className="group relative rounded-2xl bg-gradient-to-br from-green-50 to-green-50/50 border border-green-100/50 p-6 transition-all hover:border-green-200/50">
              <div className="text-4xl font-bold text-green-600">
                {loading ? "..." : pets.reduce((sum, pet: any) => sum + (pet.medicalHistory?.vaccinations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-2">Vaccinations</div>
            </div>
            <div className="group relative rounded-2xl bg-gradient-to-br from-orange-50 to-orange-50/50 border border-orange-100/50 p-6 transition-all hover:border-orange-200/50">
              <div className="text-4xl font-bold text-orange-600">
                {loading
                  ? "..."
                  : pets.filter((p: any) =>
                      p.medicalHistory?.medications?.some((m: any) =>
                        !m.endDate || new Date(m.endDate) > new Date()
                      )
                    ).length}
              </div>
              <div className="text-sm text-gray-600 mt-2">Active Medications</div>
            </div>
          </div>

          {/* Pet list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-600 mb-8">
                Start by adding your first pet and begin tracking their care.
              </p>
              <AddPetCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet: any) => (
                <PetCard key={pet._id} pet={pet} />
              ))}
              <AddPetCard />
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <button 
                onClick={() => router.push("/appointments/schedule")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-blue-50 hover:border-blue-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🗓️</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-blue-600">Schedule</div>
              </button>
              <button 
                onClick={() => router.push("/appointments")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-green-50 hover:border-green-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏥</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-green-600">Appointments</div>
              </button>
              <button 
                onClick={() => router.push("/medications/add")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-purple-50 hover:border-purple-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💊</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-purple-600">Medication</div>
              </button>
              <button 
                onClick={() => router.push("/flea-tick-treatments/add")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-amber-50 hover:border-amber-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🪲</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-amber-600">Flea & Tick</div>
              </button>
              <button 
                onClick={() => router.push("/vaccines/add")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-teal-50 hover:border-teal-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💉</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-teal-600">Vaccines</div>
              </button>
              <button 
                onClick={() => router.push("/reports")} 
                className="group rounded-xl bg-gray-50 border border-gray-100 p-4 text-center transition-all hover:bg-orange-50 hover:border-orange-200"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-orange-600">Reports</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
