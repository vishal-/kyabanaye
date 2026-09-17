"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { MealType } from "@prisma/client";
import BottomNav from "./components/BottomNav";

const toISODateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getMondayOfWeek = (date: Date) => {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const allMealMetadata: Record<
  MealType,
  { title: string; time: string; icon: string; iconBg: string }
> = {
  MORNING_DRINK: { title: "Morning Drink", time: "7:00 AM", icon: "🥛", iconBg: "bg-blue-100 text-blue-700" },
  MORNING_SNACK: { title: "Morning Snack", time: "10:30 AM", icon: "🍎", iconBg: "bg-rose-100 text-rose-700" },
  BREAKFAST: { title: "Breakfast", time: "8:30 AM", icon: "☀️", iconBg: "bg-amber-100 text-amber-700" },
  BRUNCH: { title: "Brunch", time: "11:30 AM", icon: "🥞", iconBg: "bg-orange-100 text-orange-700" },
  AFTERNOON_SNACK: { title: "Afternoon Snack", time: "4:00 PM", icon: "🍌", iconBg: "bg-yellow-100 text-yellow-700" },
  LUNCH: { title: "Lunch", time: "1:30 PM", icon: "☀️", iconBg: "bg-emerald-100 text-emerald-700" },
  EVENING_SNACK: { title: "Evening Snack", time: "5:30 PM", icon: "☕", iconBg: "bg-violet-100 text-violet-700" },
  DINNER: { title: "Dinner", time: "8:30 PM", icon: "🌙", iconBg: "bg-pink-100 text-pink-700" },
  DESSERT: { title: "Dessert", time: "9:30 PM", icon: "🍰", iconBg: "bg-red-100 text-red-700" },
  DRINK: { title: "Drink", time: "10:00 PM", icon: "🍹", iconBg: "bg-teal-100 text-teal-700" },
};

const chronologicalOrder: MealType[] = [
  "MORNING_DRINK",
  "MORNING_SNACK",
  "BREAKFAST",
  "BRUNCH",
  "LUNCH",
  "AFTERNOON_SNACK",
  "EVENING_SNACK",
  "DINNER",
  "DESSERT",
  "DRINK",
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [dayPlan, setDayPlan] = useState<Record<string, string[]>>({});
  const [fetchingPlan, setFetchingPlan] = useState(false);

  // Fetch plan for the selected single date
  useEffect(() => {
    const fetchPlan = async () => {
      setFetchingPlan(true);
      const dateStr = toISODateString(selectedDate);
      try {
        const res = await fetch(`/api/mealplans?startDate=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDayPlan(data[0].meals || {});
          } else {
            setDayPlan({});
          }
        }
      } catch (e) {
        console.error("Failed to load daily plan:", e);
      } finally {
        setFetchingPlan(false);
      }
    };

    fetchPlan();
  }, [selectedDate]);

  const handlePrevWeek = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
  };

  // Generate 7 days starting from the week's Monday
  const getVisibleDays = (startDate: Date) => {
    const daysList = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      daysList.push(d);
    }
    return daysList;
  };

  const currentMonday = getMondayOfWeek(selectedDate);
  const visibleDays = getVisibleDays(currentMonday);

  // Compile list of meals to display
  const getMealsToDisplay = () => {
    const list: Array<{
      id: MealType;
      title: string;
      time: string;
      icon: string;
      iconBg: string;
      dishes: string[];
    }> = [];

    chronologicalOrder.forEach((mealId) => {
      const dishes = dayPlan[mealId] || [];
      const isCore =
        mealId === "BREAKFAST" ||
        mealId === "LUNCH" ||
        mealId === "EVENING_SNACK" ||
        mealId === "DINNER";

      if (isCore || dishes.length > 0) {
        const meta = allMealMetadata[mealId];
        list.push({
          id: mealId,
          ...meta,
          dishes,
        });
      }
    });

    return list;
  };

  const displayMeals = getMealsToDisplay();

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 text-slate-900 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mt-1 lg:flex lg:gap-8">
          {/* Main Daily Plan Section */}
          <div className="lg:w-2/3 space-y-6">
            {/* Infinite Date Slider */}
            <section className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                <button
                  onClick={handlePrevWeek}
                  className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200 transition-all cursor-pointer flex-shrink-0"
                  title="Previous Week"
                >
                  <FiChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <div className="flex-grow flex items-center justify-between gap-1 overflow-hidden py-1">
                  {visibleDays.map((d) => {
                    const isActive = toISODateString(d) === toISODateString(selectedDate);
                    const isToday = toISODateString(d) === toISODateString(new Date());
                    const dayNum = d.getDate();
                    const dayShort = d.toLocaleString("default", { weekday: "short" });
                    const monthShort = d.toLocaleString("default", { month: "short" });

                    return (
                      <button
                        key={d.getTime()}
                        onClick={() => setSelectedDate(d)}
                        className={`flex-1 min-w-0 max-w-[50px] sm:max-w-[64px] text-center py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider opacity-85 truncate">
                          {dayShort}
                        </div>
                        <div className="text-sm sm:text-lg font-black leading-tight my-0.5 sm:my-1">
                          {dayNum}
                        </div>
                        <div className="text-[7px] sm:text-[9px] font-semibold opacity-85 truncate">
                          {monthShort}
                        </div>
                        {isToday && !isActive && (
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full mx-auto mt-0.5 sm:mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextWeek}
                  className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200 transition-all cursor-pointer flex-shrink-0"
                  title="Next Week"
                >
                  <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </section>

            {/* Meals Display Area */}
            <main className="space-y-4">
              {fetchingPlan ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">Loading daily plan...</p>
                </div>
              ) : (
                displayMeals.map((meal) => {
                  const hasDishes = meal.dishes.length > 0;
                  return (
                    <article
                      key={meal.id}
                      className="flex items-start justify-between bg-white rounded-3xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md"
                    >
                      <div className="flex gap-4 items-start">
                        <div
                          className={`flex items-center justify-center p-3 rounded-2xl ${meal.iconBg} w-12 h-12 text-xl font-bold flex-shrink-0 shadow-2xs`}
                        >
                          {meal.icon}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {meal.title}
                            </h3>
                          </div>

                          {hasDishes ? (
                            <div className="flex flex-wrap gap-2 items-center pt-0.5">
                              {meal.dishes.map((dish, i) => (
                                <span
                                  key={`${dish}-${i}`}
                                  className="inline-flex items-center rounded-2xl bg-slate-100/90 border border-slate-200/80 px-3.5 py-1.5 text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-200/70 transition-all"
                                >
                                  {dish}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 italic font-medium">
                              No meals planned for this slot
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-3 py-1 rounded-xl">
                          {meal.time}
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </main>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
