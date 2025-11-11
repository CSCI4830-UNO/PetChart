"use client";

import SignOutBtn from "@/components/SignOutBtn";
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
                bulletA="Species-aware logic"
                bulletB="Shareable records"
              />
            </motion.div>

            <motion.div variants={fadeInUp(0.22)}>
              <FeatureRow
                image="/icons/medication.png"
                kicker="Medications"
                title="Reminders that actually help."
                subhead="Plan monthly or short-term meds, and log doses easily."
                bulletA="Flexible plans"
                bulletB="Attachments + refill notes"
                imageLeft
              />
            </motion.div>

            <motion.div variants={fadeInUp(0.26)}>
              <FeatureRow
              image="/icons/appointments.png"
                kicker="Appointments"
                title="A timeline you can trust."
                subhead="Wellness checks, labs, and procedures—all trackable & searchable."
                bulletA="Clinic + outcome"
                bulletB="Upload summaries"
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
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image src="/icons/favicon.ico" alt="Icon" width={100} height={100} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PetChart</h1>
                <p className="text-sm text-gray-600">Your pet’s health companion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">
                  {userSession.user?.name}
                </p>
              </div>
              <SignOutBtn />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Welcome */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 flex justify-center items-center gap-2">
              <Heart size={28} className="text-red-500" />
              Your Pet Family
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              All their records, in one place. Tap a card to see their details and medical history.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 text-center border border-gray-200 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {loading ? "..." : pets.length}
              </div>
              <div className="text-gray-600">Total Pets</div>
            </div>
            <div className="bg-white p-6 text-center border border-gray-200 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {loading ? "..." : pets.reduce((sum, pet: any) => sum + (pet.medicalHistory?.vaccinations?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Vaccinations</div>
            </div>
            <div className="bg-white p-6 text-center border border-gray-200 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {loading
                  ? "..."
                  : pets.filter((p: any) =>
                      p.medicalHistory?.medications?.some((m: any) =>
                        !m.endDate || new Date(m.endDate) > new Date()
                      )
                    ).length}
              </div>
              <div className="text-gray-600">Active Medications</div>
            </div>
          </div>

          {/* Pet list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-lg shadow-sm animate-pulse bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-300 rounded w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded" />
                    <div className="h-3 bg-gray-300 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12">
              <Image src="/icons/favicon.ico" alt="Calendar Icon" width={100} height={100} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first pet and begin tracking their care.
              </p>
              <AddPetCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet: any) => (
                <PetCard key={pet._id} pet={pet} />
              ))}
              <AddPetCard />
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => router.push("/appointments/schedule")} className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="text-2xl mb-2">🗓️</div>
                <div className="text-sm font-medium text-blue-900">Schedule Appointment</div>
              </button>
              <button onClick={() => router.push("/appointments")} className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="text-2xl mb-2">🏥</div>
                <div className="text-sm font-medium text-green-900">View Appointments</div>
              </button>
              <button onClick={() => router.push("/medications/add")} className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="text-2xl mb-2">💊</div>
                <div className="text-sm font-medium text-purple-900">Add Medication</div>
              </button>
              <button onClick={() => router.push("/reports")} className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-orange-900">View Reports</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
