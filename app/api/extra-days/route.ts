import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { ExtraDaysWorked } from "@/lib/types";

const EXTRA_DAYS_KEY = "extra-days-worked";

export async function GET() {
  try {
    const extraDays =
      (await redis.get<ExtraDaysWorked[]>(EXTRA_DAYS_KEY)) || [];
    return NextResponse.json(extraDays);
  } catch (error) {
    console.error("Error fetching extra days:", error);
    return NextResponse.json(
      { error: "Failed to fetch extra days" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, startDate, endDate, totalDays, note, year } = body;

    if (!employeeId || !employeeName || !startDate || !endDate || !totalDays || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const extraDays =
      (await redis.get<ExtraDaysWorked[]>(EXTRA_DAYS_KEY)) || [];
    const newEntry: ExtraDaysWorked = {
      id: Date.now().toString(),
      employeeId,
      employeeName,
      startDate,
      endDate,
      totalDays,
      note: note || "",
      year,
    };

    extraDays.push(newEntry);
    await redis.set(EXTRA_DAYS_KEY, extraDays);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating extra day:", error);
    return NextResponse.json(
      { error: "Failed to create extra day" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const extraDays =
      (await redis.get<ExtraDaysWorked[]>(EXTRA_DAYS_KEY)) || [];
    const filtered = extraDays.filter((entry) => entry.id !== id);

    if (filtered.length === extraDays.length) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await redis.set(EXTRA_DAYS_KEY, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting extra day:", error);
    return NextResponse.json(
      { error: "Failed to delete extra day" },
      { status: 500 }
    );
  }
}
