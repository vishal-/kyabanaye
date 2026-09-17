"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Drawer from "./Drawer";

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function AppHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const greeting = getTimeGreeting();

  return (
    <>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl p-1 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                aria-label="menu"
                className="p-2 rounded-2xl bg-white text-slate-800 shadow-sm lg:hidden hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => setDrawerOpen(true)}
              >
                <FiMenu size={20} />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Plate Slate Logo"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <span className="hidden md:inline text-slate-300">|</span>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-700">
                  {greeting}!
                </p>
                <p className="text-[10px] text-slate-400">
                  Socho kam, khao zyada
                </p>
              </div>
            </div>
            <div className="hidden lg:flex lg:items-center lg:gap-6">
              <nav className="text-sm font-medium text-slate-600 flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
