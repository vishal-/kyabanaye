import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface InputPlan {
  date: string;
  meals: Record<string, string[]>;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate") || startDateStr;

    if (!startDateStr) {
      return NextResponse.json(
        { error: "startDate is required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr + "T00:00:00.000Z");
    const endDate = new Date(endDateStr + "T23:59:59.999Z");

    const plans = await prisma.mealPlan.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Failed to fetch meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate: startDateStr, endDate: endDateStr, plans } = body;

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr + "T00:00:00.000Z");
    const endDate = new Date(endDateStr + "T23:59:59.999Z");

    await prisma.$transaction([
      prisma.mealPlan.deleteMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.mealPlan.createMany({
        data: (plans || []).map((p: InputPlan) => ({
          date: new Date(p.date + "T00:00:00.000Z"),
          meals: p.meals,
        })),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save meal plans:", error);
    return NextResponse.json(
      { error: "Failed to save meal plans", details: String(error) },
      { status: 500 }
    );
  }
}
