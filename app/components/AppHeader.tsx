"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function AppHeader() {
  const pathname = usePathname();
  const greeting = getTimeGreeting();

  return (
    <header className="bg-slate-50 border-b border-slate-200">
      <div className="w-full mx-auto py-1">
        <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Plate Slate Logo"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
              />
            </Link>            
          {/* <div className="flex items-center gap-4 sm:gap-6">
            <nav className="text-sm font-medium text-slate-600 flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                className={`hover:text-emerald-600 transition-colors ${
                  pathname === "/" ? "text-emerald-600 font-semibold" : ""
                }`}
              >
                Home
              </Link>
              <span>·</span>
              <Link
                href="/plan"
                className={`hover:text-emerald-600 transition-colors ${
                  pathname === "/plan" ? "text-emerald-600 font-semibold" : ""
                }`}
              >
                Plans
              </Link>
              <span>·</span>
              <Link
                href="/dish"
                className={`hover:text-emerald-600 transition-colors ${
                  pathname.startsWith("/dish") ? "text-emerald-600 font-semibold" : ""
                }`}
              >
                Recipes
              </Link>
            </nav>
          </div> */}
        </div>
      </div>
    </header>
  );
}

