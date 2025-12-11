"use client";

import { PetCard } from "@/components/PetCard";
import { AddPetCard } from "@/components/AddPetCard";
import { Heart} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePets } from "@/hooks/usePets";
import Image from "next/image";

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
      <div className="min-h-screen bg-white dark:bg-[#18191a] text-slate-900 dark:text-gray-100 antialiased">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-[#18191a] dark:via-[#18191a] dark:to-[#242526]">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-12">

          {/* Hero section */}
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Your Pet Family
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              All their records, in one place. Keep track of vaccinations, medications, appointments, and more.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative rounded-2xl bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-100/50 dark:border-blue-900/50 p-6 transition-all hover:border-blue-200/50 dark:hover:border-blue-800/50">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : pets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Pets</div>
            </div>
            <div className="group relative rounded-2xl bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/50 dark:to-green-900/30 border border-green-100/50 dark:border-green-900/50 p-6 transition-all hover:border-green-200/50 dark:hover:border-green-800/50">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {loading ? "..." : pets.reduce((sum, pet: any) => sum + (pet.medicalHistory?.vaccinations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Vaccinations</div>
            </div>
            <div className="group relative rounded-2xl bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-100/50 dark:border-orange-900/50 p-6 transition-all hover:border-orange-200/50 dark:hover:border-orange-800/50">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {loading
                  ? "..."
                  : pets.filter((p: any) =>
                      p.medicalHistory?.medications?.some((m: any) =>
                        !m.endDate || new Date(m.endDate) > new Date()
                      )
                    ).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active Medications</div>
            </div>
          </div>

          {/* Pet list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 dark:bg-[#242526] dark:bg-[#242526] dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-[#3a3b3c] rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-[#3a3b3c] rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-[#3a3b3c] rounded w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-[#3a3b3c] rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-[#3a3b3c] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No pets yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={() => router.push("/appointments/schedule")} 
                className="group rounded-xl bg-gray-50 dark:bg-[#242526] dark:bg-[#242526] dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] p-4 text-center transition-all hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-200 dark:hover:border-blue-900"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🗓️</div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Schedule</div>
              </button>
              <button 
                onClick={() => router.push("/appointments")} 
                className="group rounded-xl bg-gray-50 dark:bg-[#242526] dark:bg-[#242526] dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] p-4 text-center transition-all hover:bg-green-50 dark:hover:bg-green-950/50 hover:border-green-200 dark:hover:border-green-900"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏥</div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">Appointments</div>
              </button>
              <button 
                onClick={() => router.push("/medications/add")} 
                className="group rounded-xl bg-gray-50 dark:bg-[#242526] dark:bg-[#242526] dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] p-4 text-center transition-all hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-purple-200 dark:hover:border-purple-900"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💊</div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">Medication</div>
              </button>
              <button 
                onClick={() => router.push("/flea-tick-treatments/add")} 
                className="group rounded-xl bg-gray-50 dark:bg-[#242526] dark:bg-[#242526] dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] p-4 text-center transition-all hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-200 dark:hover:border-amber-900"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🐛</div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">Flea & Tick</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


