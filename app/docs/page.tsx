"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DocsPage() {
  // simple staggered entrance
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-slate-900 flex flex-col items-center justify-center px-6 py-24">
      {/* Icon */}
      <motion.div {...fadeUp(0.05)} className="mb-6 flex items-center justify-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        {...fadeUp(0.15)}
        className="text-4xl font-semibold tracking-tight mb-3 text-center"
      >
        Documentation Coming Soon
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        {...fadeUp(0.25)}
        className="text-slate-600 text-center max-w-lg mb-8"
      >
        We’re building guides to help you get the most out of PetChart—from
        tracking vaccinations and medications to managing appointments.
        <br />
        Check back soon for tutorials and API docs.
      </motion.p>

      {/* Buttons */}
      <motion.div {...fadeUp(0.35)} className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 bg-slate-100 text-slate-800 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          Contact Support
        </Link>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        {...fadeUp(0.45)}
        className="absolute bottom-10 text-sm text-slate-500"
      >
        © {new Date().getFullYear()} PetChart. Built with care for pets.
      </motion.div>
    </main>
  );
}
