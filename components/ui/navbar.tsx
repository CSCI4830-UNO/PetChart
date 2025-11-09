"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint } from "lucide-react";
import SignOutBtn from "../SignOutBtn";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();

  const handleLogoClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // If already on the homepage, scroll smoothly to the top instead of reloading
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-gray-200 transition-all duration-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <PawPrint size={18} className="text-white" />
          </div>
          <span className="font-semibold tracking-tight text-[17px] text-slate-900">
            PetChart
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-700 tracking-wide">
          {[
            { label: "Features", href: "#features" },
            { label: "Privacy", href: "#privacy" },
            { label: "Pricing", href: "/pricing" },
            { label: "FAQ", href: "/faq" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative group"
            >
              <span className="text-slate-700 group-hover:text-black transition-colors duration-300">
                {link.label}
              </span>
              <span className="absolute left-0 -bottom-[3px] w-0 h-[1.5px] bg-slate-900 transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Sign In / Sign Out */}
        <div className="flex items-center gap-3">
          {/* Show Sign In when there's no session, otherwise show Sign Out */}
          {session?.user ? (
            <SignOutBtn />
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm font-medium text-slate-900 border border-slate-300 px-3.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

