"use client";

import { useState, useEffect } from "react";
import type { MealType } from "@prisma/client";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiSave,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import PlanCell, { type DishSuggestion } from "./PlanCell";

const mealTypes: Array<{
  id: MealType;
  label: string;
  checked: boolean;
}> = [
  { id: "MORNING_DRINK", label: "Morning Drink", checked: false },
  { id: "MORNING_SNACK", label: "Morning Snack", checked: false },
  { id: "BREAKFAST", label: "Breakfast", checked: true },
  { id: "BRUNCH", label: "Brunch", checked: false },
  { id: "AFTERNOON_SNACK", label: "Afternoon Snack", checked: false },
  { id: "LUNCH", label: "Lunch", checked: true },
  { id: "EVENING_SNACK", label: "Evening Snack", checked: true },
  { id: "DINNER", label: "Dinner", checked: true },
  { id: "DESSERT", label: "Dessert", checked: false },
  { id: "DRINK", label: "Drink", checked: false },
];

const toISODateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getWeekLabel = (startDate: Date) => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = startDate.toLocaleString("default", { month: "long" });
  const endMonth = endDate.toLocaleString("default", { month: "long" });

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear !== endYear) {
    return `Week (${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear})`;
  }
  if (startMonth !== endMonth) {
    return `Week (${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear})`;
  }
  return `Week (${startDay} - ${endDay} ${startMonth} ${startYear})`;
};

const getWeekDays = (startDate: Date) => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, index) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + index);
    return {
      label,
      date: `${dayDate.getDate()} ${dayDate.toLocaleString("default", { month: "short" })}`,
      dateStr: toISODateString(dayDate),
    };
  });
};

const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const allMealRows: Array<{
  id: MealType;
  meal: string;
  icon: string;
}> = [
  { id: "MORNING_DRINK", meal: "Morning Drink", icon: "🥛" },
  { id: "MORNING_SNACK", meal: "Morning Snack", icon: "🍎" },
  { id: "BREAKFAST", meal: "Breakfast", icon: "☀️" },
  { id: "BRUNCH", meal: "Brunch", icon: "🥞" },
  { id: "AFTERNOON_SNACK", meal: "Afternoon Snack", icon: "🍌" },
  { id: "LUNCH", meal: "Lunch", icon: "☀️" },
  { id: "EVENING_SNACK", meal: "Evening Snack", icon: "☕" },
  { id: "DINNER", meal: "Dinner", icon: "🌙" },
  { id: "DESSERT", meal: "Dessert", icon: "🍰" },
  { id: "DRINK", meal: "Drink", icon: "🍹" },
];

export default function PlanPage() {
  const router = useRouter();

  const [activeMealTypes, setActiveMealTypes] = useState(mealTypes);
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfCurrentWeek());
  const [allDishes, setAllDishes] = useState<DishSuggestion[]>([]);
  const [grid, setGrid] = useState<Record<string, string[]>>({});
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch all dishes on mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await fetch("/api/dishes?limit=all");
        if (res.ok) {
          const data = await res.json();
          setAllDishes(data.dishes || []);
        }
      } catch (err) {
        console.error("Error fetching dishes:", err);
      }
    };
    fetchDishes();
  }, []);

  // Load weekly plan from database when week start changes
  useEffect(() => {
    const loadPlan = async () => {
      const startDateStr = toISODateString(weekStart);
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const endDateStr = toISODateString(endDate);

      try {
        const res = await fetch(
          `/api/mealplans?startDate=${startDateStr}&endDate=${endDateStr}`
        );
        if (res.ok) {
          interface PlanRecord {
            date: string;
            meals: Record<string, string[]>;
          }
          const data: PlanRecord[] = await res.json();
          // Translate JSON structure into flat state grid
          const newGrid: Record<string, string[]> = {};
          data.forEach((plan: PlanRecord) => {
            const planDate = new Date(plan.date);
            const dateKey = toISODateString(planDate);
            const meals = plan.meals as Record<string, string[]>;
            Object.entries(meals).forEach(([mealType, dishes]) => {
              newGrid[`${dateKey}_${mealType}`] = dishes;
            });
          });
          setGrid(newGrid);
        }
      } catch (e) {
        console.error("Failed to load plan from database:", e);
      }
    };

    loadPlan();
  }, [weekStart]);

  const toggleMealType = (id: MealType) => {
    setActiveMealTypes((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, checked: !meal.checked } : meal
      )
    );
  };

  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(prev.getDate() - 7);
      return nextDate;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(prev.getDate() + 7);
      return nextDate;
    });
  };

  const handleSave = async () => {
    const startDateStr = toISODateString(weekStart);
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const endDateStr = toISODateString(endDate);

    // Format grid state to database schema format
    const plans = currentWeekDays
      .map((day) => {
        const meals: Record<string, string[]> = {};
        allMealRows.forEach((row) => {
          const key = `${day.dateStr}_${row.id}`;
          const dishes = grid[key];
          if (dishes && dishes.length > 0) {
            meals[row.id] = dishes;
          }
        });
        return {
          date: day.dateStr,
          meals,
        };
      })
      .filter((p) => Object.keys(p.meals).length > 0);

    try {
      const res = await fetch("/api/mealplans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          plans,
        }),
      });

      if (res.ok) {
        setSaveMessage("Meal plan saved!");
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage(`Failed to save plan: ${errData.error || "Server error"}`);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save plan to database:", e);
      setSaveMessage("Failed to save plan: Network error");
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }
  };

  const todayStr = toISODateString(new Date());

  const handleAddDish = (dateStr: string, mealType: MealType, dishName: string) => {
    if (dateStr < todayStr) return;

    const key = `${dateStr}_${mealType}`;
    setGrid((prev) => {
      const current = prev[key] || [];
      if (current.includes(dishName)) return prev;
      return {
        ...prev,
        [key]: [...current, dishName],
      };
    });
  };

  const handleRemoveDish = (dateStr: string, mealType: MealType, dishName: string) => {
    if (dateStr < todayStr) return;

    const key = `${dateStr}_${mealType}`;
    setGrid((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.filter((d) => d !== dishName),
      };
    });
  };

  const currentWeekDays = getWeekDays(weekStart);

  const visibleRows = allMealRows.filter((row) => {
    const mealTypeObj = activeMealTypes.find((m) => m.id === row.id);
    return mealTypeObj ? mealTypeObj.checked : false;
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {showSaveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl animate-fade-in duration-300">
          <FiCheckCircle className="text-emerald-400" size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-[90rem]">
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-4 shadow-sm sm:px-6">
          <button 
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 cursor-pointer"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Meal Planning
            </h1>
            <p className="text-sm text-slate-500">
              Plan your week. Eat healthy, stay happy!
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
          >
            <FiSave size={16} /> Save
          </button>
        </div>

        {/* Week Nav */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-3xl bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handlePrevWeek}
                  className="inline-flex items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600 shadow-sm cursor-pointer"
                  title="Previous Week"
                >
                  <FiChevronLeft size={16} />
                </button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <span>{getWeekLabel(weekStart)}</span>
                </div>
                <button
                  onClick={handleNextWeek}
                  className="inline-flex items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600 shadow-sm cursor-pointer"
                  title="Next Week"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-white px-4 py-3 shadow-sm sm:px-6">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Select meal types
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeMealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => toggleMealType(meal.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                  meal.checked
                    ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{meal.label}</span>
                {meal.checked && (
                  <FiCheckCircle size={12} className="text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View */}
        <div className="mt-4 space-y-4 sm:hidden">
          {visibleRows.map((row) => (
            <div
              key={row.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  <span>{row.icon}</span>
                  <span>{row.meal}</span>
                </div>
                <span className="text-xs text-slate-500">7 days</span>
              </div>
              <div className="mt-4 space-y-3">
                {currentWeekDays.map((day) => {
                  const cellKey = `${day.dateStr}_${row.id}`;
                  const selectedDishes = grid[cellKey] || [];
                  const isPast = day.dateStr < todayStr;
                  return (
                    <div
                      key={`${row.id}-${day.label}`}
                      className={`rounded-2xl px-4 py-3 border ${
                        isPast
                          ? "bg-slate-100/50 border-slate-200/60"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                        <span>
                          {day.label} ({day.date})
                        </span>
                        {isPast && (
                          <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">
                            (past day)
                          </span>
                        )}
                      </div>
                      <PlanCell
                        dateStr={day.dateStr}
                        mealType={row.id}
                        selectedDishes={selectedDishes}
                        allDishes={allDishes}
                        onAddDish={(name) => handleAddDish(day.dateStr, row.id, name)}
                        onRemoveDish={(name) => handleRemoveDish(day.dateStr, row.id, name)}
                        readOnly={isPast}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-sm sm:block border border-slate-100">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-4 font-semibold">Meals \ Days</th>
                {currentWeekDays.map((day) => {
                  const isPast = day.dateStr < todayStr;
                  const isToday = day.dateStr === todayStr;
                  return (
                    <th
                      key={day.label}
                      className={`border-l border-slate-200 px-4 py-4 ${
                        isPast
                          ? "bg-slate-100/50"
                          : isToday
                          ? "bg-emerald-50/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              isPast
                                ? "text-slate-400"
                                : isToday
                                ? "text-emerald-700 font-bold"
                                : "text-slate-900"
                            }`}
                          >
                            {day.label}
                          </div>
                          <div className="text-xs text-slate-500">{day.date}</div>
                        </div>
                        {isToday && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full ml-1">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="border-l border-slate-200 px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-5 align-top">
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-100">
                      <span>{row.icon}</span>
                      <span>{row.meal}</span>
                    </div>
                  </td>
                  {currentWeekDays.map((day) => {
                    const cellKey = `${day.dateStr}_${row.id}`;
                    const selectedDishes = grid[cellKey] || [];
                    const isPast = day.dateStr < todayStr;
                    return (
                      <td
                        key={`${row.id}-${day.label}`}
                        className={`border-l border-slate-200 px-2 py-3 align-top ${
                          isPast ? "bg-slate-50/50" : ""
                        }`}
                      >
                        <PlanCell
                          dateStr={day.dateStr}
                          mealType={row.id}
                          selectedDishes={selectedDishes}
                          allDishes={allDishes}
                          onAddDish={(name) => handleAddDish(day.dateStr, row.id, name)}
                          onRemoveDish={(name) => handleRemoveDish(day.dateStr, row.id, name)}
                          readOnly={isPast}
                        />
                      </td>
                    );
                  })}
                  <td className="border-l border-slate-200 px-4 py-5 align-top text-right text-slate-400">
                    ···
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 shadow-sm sm:px-6">
          <div className="flex items-center gap-3 font-medium text-emerald-700">
            <span className="rounded-full bg-emerald-100 px-2 py-1">i</span>
            Search and add multiple dishes to any meal cell. Click the &quot;Save&quot; button to save your weekly plan.
          </div>
        </div>
      </div>
    </div>
  );
}
