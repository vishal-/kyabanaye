"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomNav from "@/app/components/BottomNav";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: "VEG" | "NON_VEG" | "EGG" | null;
  suggestedMealTypes: string[];
};

const categoryBadge: Record<string, string> = {
  VEG: "bg-emerald-100 text-emerald-700",
  NON_VEG: "bg-rose-100 text-rose-700",
  EGG: "bg-amber-100 text-amber-700",
};

const categoryLabel: Record<string, string> = {
  VEG: "🌿 Veg",
  NON_VEG: "🍗 Non-Veg",
  EGG: "🥚 Egg",
};

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDishes = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });

      try {
        const r = await fetch(`/api/dishes?${params}`);
        const data = await r.json();
        if (isMounted) {
          setDishes(data.dishes || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to load dishes:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDishes();
    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dishes</h1>
          {!loading && (
            <p className="text-xs text-slate-400">
              {total} dish{total !== 1 ? "es" : ""}
            </p>
          )}
        </div>
        <Link
          href="/dish/add"
          className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
        >
          <FiPlus size={16} /> Add Dish
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">No dishes yet</p>
            <p className="text-sm mt-1">Add your first dish to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {dishes.map((dish) => (
              <Link
                key={dish.id}
                href={`/dish/${dish.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition"
              >
                {/* Image / placeholder */}
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍴
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 truncate">
                      {dish.name}
                    </p>
                  </div>
                  {dish.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {dish.description}
                    </p>
                  )}
                  {dish.category && (
                    <span
                      className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryBadge[dish.category]}`}
                    >
                      {categoryLabel[dish.category]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
