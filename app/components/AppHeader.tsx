"use client";

import Link from "next/link";

export default function AppHeader() {
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
        </div>
      </div>
    </header>
  );
}

