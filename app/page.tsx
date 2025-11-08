"use client";

import { SignInBtn } from "@/components/signInBtn";
import SignOutBtn from "@/components/SignOutBtn";
import { PetCard } from "@/components/PetCard";
import { AddPetCard } from "@/components/AddPetCard";
import { Heart, PawPrint } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePets } from "@/hooks/usePets";

// Marketing components
import NavBar from "@/components/ui/navbar";
import Hero from "@/components/ui/hero";
import FeatureRow from "@/components/ui/featurerow";
import PrivacyCard from "@/components/ui/privacycard";
import CTA from "@/components/ui/cta";
import Footer from "@/components/ui/footer";

// Framer-motion
import { motion } from "framer-motion";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const { pets, loading } = usePets();

  // Helpers for a clean entrance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, duration: 0.3 }
    }
  };
  const fadeUp = (d = 0) => ({
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } }
  });

  // -------- Signed OUT: Marketing (animated) --------
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 antialiased">
        <NavBar />

        <motion.main
          initial="hidden"
          animate="show"
          variants={container}
        >
          {/* Hero */}
          <motion.div variants={fadeUp(0.05)}>
            <Hero />
          </motion.div>

          {/* Features */}
          <motion.section
            id="features"
            className="mx-auto max-w-7xl px-6 py-20"
            variants={fadeUp(0.1)}
          >
            <motion.div variants={fadeUp(0.12)}>
              <FeatureRow
                kicker="Vaccinations"
                title="Never miss a booster again."
                copy="Automatic schedules by species and age. Clear statuses for due, upcoming, and overdue."
                bulletA="Species-aware schedules"
                bulletB="Export/share records"
              />
            </motion.div>

            <motion.div variants={fadeUp(0.16)}>
              <FeatureRow
                kicker="Medications"
                title="Reminders that actually help."
                copy="Monthly preventatives or short-term meds—set a plan and mark doses with a tap."
                bulletA="Flexible dosing plans"
                bulletB="Refill notes & attachments"
                imageLeft
              />
            </motion.div>

            <motion.div variants={fadeUp(0.2)}>
              <FeatureRow
                kicker="Appointments"
                title="A timeline you can trust."
                copy="Wellness checks, procedures, and labs—searchable, shareable, always organized."
                bulletA="Clinic, reason, outcome"
                bulletB="Upload visit summaries"
              />
            </motion.div>
          </motion.section>

          {/* Privacy + CTA + Footer */}
          <motion.div variants={fadeUp(0.25)}>
            <PrivacyCard />
          </motion.div>
          <motion.div variants={fadeUp(0.3)}>
            <CTA />
          </motion.div>
          <Footer />
        </motion.main>
      </div>
    );
  }

  // -------- Signed IN: Dashboard --------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <PawPrint size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PetChart</h1>
                <p className="text-sm text-gray-600">Your pet's health companion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Heart size={28} className="text-red-500" />
              Your Pet Family
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep track of your pets' health, vaccinations, treatments, and more all in one place.
              Click on any pet card to view detailed information and medical history.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{loading ? "..." : pets.length}</div>
              <div className="text-gray-600">Total Pets</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {loading ? "..." : pets.reduce((sum, pet: any) => sum + (pet.medicalHistory?.vaccinations?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Vaccinations</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {loading ? "..." : pets.filter((pet: any) =>
                  pet.medicalHistory?.medications?.some((med: any) =>
                    !med.endDate || new Date(med.endDate) > new Date()
                  )
                ).length}
              </div>
              <div className="text-gray-600">Active Medications</div>
            </div>
          </div>

          {/* Pet grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
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
              <PawPrint size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first pet to begin tracking their health and appointments.
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => router.push("/appointments/schedule")} className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-2xl mb-2">🗓️</div>
                <div className="text-sm font-medium text-blue-900">Schedule Appointment</div>
              </button>
              <button onClick={() => router.push("/appointments")} className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-2xl mb-2">🏥</div>
                <div className="text-sm font-medium text-green-900">View Appointments</div>
              </button>
              <button onClick={() => router.push("/medications/add")} className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="text-2xl mb-2">💊</div>
                <div className="text-sm font-medium text-purple-900">Add Medication</div>
              </button>
              <button onClick={() => router.push("/reports")} className="p-4 text-center bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
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
