// PRAVAH + LifeLane - System Metrics API Route
import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/db/access";
import type { ApiResponse } from "@/types";

// GET /api/metrics - Get dashboard metrics
export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json<ApiResponse<typeof metrics>>({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch metrics",
      },
      { status: 500 }
    );
  }
}
