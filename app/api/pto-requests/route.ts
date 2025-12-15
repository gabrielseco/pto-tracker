import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { PTORequest } from "@/lib/types";

const PTO_REQUESTS_KEY = "pto-requests";

export async function GET() {
  try {
    const requests = (await redis.get<PTORequest[]>(PTO_REQUESTS_KEY)) || [];
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching PTO requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch PTO requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, startDate, endDate, totalDays, year } =
      body;

    if (
      !employeeId ||
      !employeeName ||
      !startDate ||
      !endDate ||
      totalDays === undefined ||
      !year
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const requests = (await redis.get<PTORequest[]>(PTO_REQUESTS_KEY)) || [];
    const newRequest: PTORequest = {
      id: Date.now().toString(),
      employeeId,
      employeeName,
      startDate,
      endDate,
      totalDays: Number(totalDays),
      year: Number(year),
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    await redis.set(PTO_REQUESTS_KEY, requests);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating PTO request:", error);
    return NextResponse.json(
      { error: "Failed to create PTO request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      employeeId,
      employeeName,
      startDate,
      endDate,
      totalDays,
      year,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const requests = (await redis.get<PTORequest[]>(PTO_REQUESTS_KEY)) || [];
    const index = requests.findIndex((req) => req.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    requests[index] = {
      ...requests[index],
      ...(employeeId && { employeeId }),
      ...(employeeName && { employeeName }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(totalDays !== undefined && { totalDays: Number(totalDays) }),
      ...(year && { year: Number(year) }),
    };

    await redis.set(PTO_REQUESTS_KEY, requests);

    return NextResponse.json(requests[index]);
  } catch (error) {
    console.error("Error updating PTO request:", error);
    return NextResponse.json(
      { error: "Failed to update PTO request" },
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
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const requests = (await redis.get<PTORequest[]>(PTO_REQUESTS_KEY)) || [];
    const filteredRequests = requests.filter((req) => req.id !== id);

    if (filteredRequests.length === requests.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await redis.set(PTO_REQUESTS_KEY, filteredRequests);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PTO request:", error);
    return NextResponse.json(
      { error: "Failed to delete PTO request" },
      { status: 500 }
    );
  }
}
