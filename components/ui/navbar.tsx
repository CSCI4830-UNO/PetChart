"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutBtn from "../SignOutBtn";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Nav bar logic
export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuIsOpen, toggleMenu] = useState(false);

  // prevent page reload when already on home, but only if on /
  const maybeScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth", // smooth scroll bc otherwise feels broken
      });
    }
  };

  // links, might reuse but just left here for now
  // add more links as needed here
  const mainLinks = [
    { label: "Features", href: "#features" },
    { label: "Privacy", href: "#privacy" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={maybeScrollToTop} className="flex items-center gap-[6px]">
          <div className="w-8 h-8 rounded-md overflow-hidden">
            <Image src="/icons/favicon.ico" alt="Logo" width={100} height={100} />
          </div>
          <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
            PetChart
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex gap-8 text-[15px] font-medium text-slate-700">
          <Link href="#features" className="hover:text-black transition-colors">Features</Link>
          <Link href="#privacy" className="hover:text-black transition-colors">Privacy</Link>
          <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
        </div>

        {/* Sign in button */}
        <div className="hidden md:flex gap-3 items-center">
          {session && session.user ? (
            <>
              {/* might add avatar later */}
              <SignOutBtn />
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-700 hover:text-black"
          onClick={() => toggleMenu(!menuIsOpen)}
        >
          {menuIsOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile only dropdown */}
      {/* Animations for the dropdown are also here */}
      <AnimatePresence>
        {menuIsOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute w-full bg-white md:hidden shadow-md border-t border-gray-200"
          >
            <div className="flex flex-col items-center py-6 gap-4 text-[15px] text-slate-700 font-medium">
              <Link href="#features" onClick={() => toggleMenu(false)} className="hover:text-black">
                Features
              </Link>
              <Link href="#privacy" onClick={() => toggleMenu(false)} className="hover:text-black">
                Privacy
              </Link>
              <Link href="/faq" onClick={() => toggleMenu(false)} className="hover:text-black">
                FAQ
              </Link>

              {session && session.user ? (
                <SignOutBtn />
              ) : (
                <Link
                  href="/api/auth/signin"
                  onClick={() => toggleMenu(false)}
                  className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
