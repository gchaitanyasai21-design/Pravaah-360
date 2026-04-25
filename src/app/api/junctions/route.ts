// PRAVAH + LifeLane - Traffic Junction API Routes
import { NextRequest, NextResponse } from "next/server";
import {
  getAllJunctions,
  getJunctionById,
  updateJunctionStatus,
  updateJunctionSignals,
  updateJunctionMetrics,
} from "@/db/access";
import type { ApiResponse } from "@/types";

// GET /api/junctions - Get all traffic junctions
export async function GET() {
  try {
    const junctions = await getAllJunctions();
    return NextResponse.json<ApiResponse<typeof junctions>>({
      success: true,
      data: junctions,
    });
  } catch (error) {
    console.error("Error fetching junctions:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch junctions",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/junctions/:id/override - Manual override of junction signals
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, signals, metrics } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Junction ID is required",
        },
        { status: 400 }
      );
    }

    let junction;

    // Update status if provided
    if (status) {
      junction = await updateJunctionStatus(id, status);
    }

    // Update signals if provided
    if (signals) {
      junction = await updateJunctionSignals(id, signals);
    }

    // Update metrics if provided
    if (metrics) {
      junction = await updateJunctionMetrics(id, metrics);
    }

    if (!junction) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Junction not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof junction>>({
      success: true,
      data: junction,
      message: "Junction updated successfully",
    });
  } catch (error) {
    console.error("Error updating junction:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to update junction",
      },
      { status: 500 }
    );
  }
}
