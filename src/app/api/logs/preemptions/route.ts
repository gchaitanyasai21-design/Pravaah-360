// PRAVAH + LifeLane - Preemption Logs API Routes
import { NextRequest, NextResponse } from "next/server";
import { getPreemptionLogs } from "@/db/access";
import type { ApiResponse } from "@/types";

// GET /api/logs/preemptions - Get preemption history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const junctionId = searchParams.get("junctionId");
    const ambulanceId = searchParams.get("ambulanceId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const logs = await getPreemptionLogs(
      junctionId || undefined,
      ambulanceId || undefined,
      limit
    );

    return NextResponse.json<ApiResponse<typeof logs>>({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching preemption logs:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch preemption logs",
      },
      { status: 500 }
    );
  }
}
