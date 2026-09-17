-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('MORNING_DRINK', 'MORNING_SNACK', 'BREAKFAST', 'BRUNCH', 'AFTERNOON_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'DESSERT', 'DRINK');

-- CreateEnum
CREATE TYPE "DishCategory" AS ENUM ('VEG', 'NON_VEG', 'EGG');

-- CreateTable
CREATE TABLE "Dish" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "recipeUrl" TEXT,
    "category" "DishCategory",
    "suggestedMealTypes" "MealType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dish_name_key" ON "Dish"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_date_key" ON "MealPlan"("date");
