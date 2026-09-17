"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiX, FiCalendar, FiGrid, FiList } from "react-icons/fi";

const links = [
  { href: "/", label: "Today's Plan", icon: FiCalendar },
  { href: "/plan", label: "Weekly Plan", icon: FiGrid },
  { href: "/dish", label: "Dishes", icon: FiList },
];

export default function Drawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col border-b border-slate-100 px-5 py-4 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Plate Slate Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        <nav className="flex flex-col mt-4 px-3 gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
