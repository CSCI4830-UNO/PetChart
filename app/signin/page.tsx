"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

// Sign-in page for PetChart
// (Note: we could refactor to use a layout later)
export default function SignInPage() {
  const handleGoogleLogin = () => {
    // I might add loading feedback later
    signIn("google", { callbackUrl: "/" });
  };

  const currentYear = new Date().getFullYear(); // feels cleaner than inline, even if redundant

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 dark:from-[#18191a] via-white dark:via-[#18191a] to-pink-50 dark:to-[#242526] text-slate-900 dark:text-gray-100">
      {/* Main sign-in box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white dark:bg-[#242526] border border-gray-100 dark:border-[#3a3b3c] shadow-xl rounded-2xl p-8"
      >
        {/* Logo and heading */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/icons/favicon.ico"
            alt="PetChart"
            width={64}
            height={64}
            priority
          />
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to PetChart
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
            Sign in to manage your pet’s health records
          </p>
        </div>

        {/* Sign in button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Image
            src="/icons/google.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* Navigation link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Home
          </Link>
        </p>
      </motion.div>

      {/* Footer text */}
      <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
        © {currentYear} PetChart. All rights reserved.
      </p>
    </div>
  );
}



