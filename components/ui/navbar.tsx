"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Menu, X, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Nav bar logic
export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuIsOpen, toggleMenu] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <nav className="sticky top-0 z-50 bg-white/60 dark:bg-[#18191a]/60 backdrop-blur-md border-b border-gray-200 dark:border-[#3a3b3c]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={maybeScrollToTop} className="flex items-center gap-[6px]">
          <div className="w-8 h-8 rounded-md overflow-hidden">
            <Image src="/icons/favicon.ico" alt="Logo" width={100} height={100} />
          </div>
          <span className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight">
            PetChart
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex gap-8 text-[15px] font-medium text-slate-700 dark:text-slate-300">
          <Link href="#features" className="relative hover:text-black dark:hover:text-white transition-colors group">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="#privacy" className="relative hover:text-black dark:hover:text-white transition-colors group">
            Privacy
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/faq" className="relative hover:text-black dark:hover:text-white transition-colors group">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        {/* Sign in button / Avatar dropdown */}
        <div className="hidden md:flex gap-3 items-center">
          {session && session.user ? (
            <>
              {/* Welcome message */}
              <div className="text-right mr-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name || "User"}
                </p>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    console.log("Avatar clicked, current state:", avatarDropdownOpen);
                    setAvatarDropdownOpen(!avatarDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
                  aria-label="User menu"
                >
                  {/* Avatar - use Google image if available, otherwise gradient */}
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-base">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : session.user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  {/* Chevron icon */}
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {avatarDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3a3b3c] overflow-hidden z-50"
                    >
                      {/* User info header */}
                      <div className="px-5 py-4 border-b border-gray-200 dark:border-[#3a3b3c]">
                        <div className="flex items-center gap-3 mb-3">
                          {session.user.image ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                              {session.user.name ? session.user.name.charAt(0).toUpperCase() : session.user.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {session.user.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <Link
                          href="/settings"
                          onClick={() => setAvatarDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings & privacy</span>
                        </Link>
                        
                        <button
                          onClick={async () => {
                            setAvatarDropdownOpen(false);
                            await signOut({ redirect: false });
                            window.location.href = "/";
                          }}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 dark:border-[#3a3b3c] text-slate-900 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
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
            className="absolute w-full bg-white dark:bg-[#242526] md:hidden shadow-md border-t border-gray-200 dark:border-[#3a3b3c]"
          >
            <div className="flex flex-col items-center py-6 gap-4 text-[15px] text-slate-700 dark:text-slate-300 font-medium">
              <Link href="#features" onClick={() => toggleMenu(false)} className="hover:text-black dark:hover:text-white">
                Features
              </Link>
              <Link href="#privacy" onClick={() => toggleMenu(false)} className="hover:text-black dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/faq" onClick={() => toggleMenu(false)} className="hover:text-black dark:hover:text-white">
                FAQ
              </Link>

              {session && session.user ? (
                <>
                  <Link href="/settings" onClick={() => toggleMenu(false)} className="hover:text-black dark:hover:text-white">
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      toggleMenu(false);
                      await signOut({ redirect: false });
                      window.location.href = "/";
                    }}
                    className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 dark:border-[#3a3b3c] text-slate-900 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#3a3b3c]"
                  >
                    Sign Out
                  </button>
                </>
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
