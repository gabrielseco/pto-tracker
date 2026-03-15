import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { StandbyDay } from "@/lib/types";

const STANDBY_DAYS_KEY = "standby-days";

export async function GET() {
  try {
    const standbyDays = (await redis.get<StandbyDay[]>(STANDBY_DAYS_KEY)) || [];
    return NextResponse.json(standbyDays);
  } catch (error) {
    console.error("Error fetching standby days:", error);
    return NextResponse.json(
      { error: "Failed to fetch standby days" },
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

    const standbyDays = (await redis.get<StandbyDay[]>(STANDBY_DAYS_KEY)) || [];
    const newEntry: StandbyDay = {
      id: Date.now().toString(),
      employeeId,
      employeeName,
      startDate,
      endDate,
      totalDays,
      note: note || "",
      year,
    };

    standbyDays.push(newEntry);
    await redis.set(STANDBY_DAYS_KEY, standbyDays);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating standby day:", error);
    return NextResponse.json(
      { error: "Failed to create standby day" },
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

    const standbyDays = (await redis.get<StandbyDay[]>(STANDBY_DAYS_KEY)) || [];
    const filtered = standbyDays.filter((entry) => entry.id !== id);

    if (filtered.length === standbyDays.length) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await redis.set(STANDBY_DAYS_KEY, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting standby day:", error);
    return NextResponse.json(
      { error: "Failed to delete standby day" },
      { status: 500 }
    );
  }
}
