"use client";

import { useRef, useState } from "react";
import { FiArrowLeft, FiImage, FiLink, FiSave } from "react-icons/fi";
import { useRouter } from "next/navigation";

export type DishFormData = {
  name: string;
  description: string;
  recipeUrl: string;
  category: "veg" | "egg" | "nonveg";
  selectedMealTypes: string[];
  imageName?: string;
};

const mealTypeOptions = [
  { id: "morning-drink", label: "Morning Drink", icon: "🥤" },
  { id: "morning-snack", label: "Morning Snack", icon: "🍎" },
  { id: "breakfast", label: "Breakfast", icon: "🥣" },
  { id: "brunch", label: "Brunch", icon: "🍞" },
  { id: "afternoon-snack", label: "Afternoon Snack", icon: "🍉" },
  { id: "lunch", label: "Lunch", icon: "⏰" },
  { id: "evening-snack", label: "Evening Snack", icon: "☕" },
  { id: "dinner", label: "Dinner", icon: "🌙" },
  { id: "dessert", label: "Dessert", icon: "🍨" },
  { id: "drink", label: "Drink", icon: "🥛" },
];

const categoryOptions = [
  { value: "veg", label: "Veg", icon: "🌿" },
  { value: "egg", label: "Egg", icon: "🥚" },
  { value: "nonveg", label: "Non-Veg", icon: "🍗" },
] as const;

const defaultFormData: DishFormData = {
  name: "",
  description: "",
  recipeUrl: "",
  category: "veg",
  selectedMealTypes: ["breakfast", "lunch", "dinner"],
  imageName: undefined,
};

export default function DishForm({
  title,
  initialDish,
}: {
  title: string;
  initialDish?: DishFormData;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<DishFormData>(
    initialDish ?? defaultFormData,
  );

  const descriptionLength = form.description.length;
  const selectedCount = form.selectedMealTypes.length;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSaveDisabled =
    form.name.trim().length === 0 || selectedCount === 0 || saving;

  const handleToggleMealType = (id: string) => {
    setForm((prev) => {
      const selected = prev.selectedMealTypes.includes(id);
      return {
        ...prev,
        selectedMealTypes: selected
          ? prev.selectedMealTypes.filter((type) => type !== id)
          : [...prev.selectedMealTypes, id],
      };
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, imageName: file.name }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save dish");
        return;
      }
      router.push("/dish");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {title}
            </h1>
            <p className="text-sm text-slate-500">
              Add a new dish to use in your meal plans.
            </p>
          </div>
          <button
            type="submit"
            form="dish-form"
            disabled={isSaveDisabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            <FiSave size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <form
          id="dish-form"
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-3xl bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <label
              htmlFor="dish-name"
              className="text-sm font-semibold text-slate-700"
            >
              Dish Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="dish-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="e.g. Palak Paneer"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="dish-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description <span className="text-slate-400">(Optional)</span>
              </label>
              <span className="text-sm text-slate-400">
                {descriptionLength}/300
              </span>
            </div>
            <textarea
              id="dish-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Describe this dish..."
              maxLength={300}
              rows={4}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Dish Image <span className="text-slate-400">(Optional)</span>
            </label>
            <div
              className="group relative cursor-pointer rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-10 text-center transition hover:border-emerald-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage size={28} className="mx-auto text-emerald-500" />
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Tap to upload image
              </p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG up to 5MB</p>
              {form.imageName ? (
                <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  {form.imageName}
                </p>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recipe-url"
              className="text-sm font-semibold text-slate-700"
            >
              Recipe URL <span className="text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <FiLink className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="recipe-url"
                value={form.recipeUrl}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    recipeUrl: event.target.value,
                  }))
                }
                placeholder="https://example.com/recipe"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Category</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {categoryOptions.map((option) => {
                const active = form.category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, category: option.value }))
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-sm font-medium transition ${active ? "border-emerald-500 bg-white text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    <span className="rounded-full bg-emerald-100 px-3 py-2 text-base">
                      {option.icon}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Suggested Meal Types <span className="text-rose-500">*</span>
                </p>
                <p className="text-xs text-slate-400">Select all that apply</p>
              </div>
              <span className="text-sm text-slate-500">
                {selectedCount} selected
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mealTypeOptions.map((option) => {
                const active = form.selectedMealTypes.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleMealType(option.id)}
                    className={`flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium transition ${active ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-base">
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              <FiSave size={16} /> {saving ? "Saving…" : "Save Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
