// PRAVAH + LifeLane - Hospital API Routes
import { NextRequest, NextResponse } from "next/server";
import { getAllHospitals, getHospitalById, findNearestHospital } from "@/db/access";
import type { ApiResponse } from "@/types";

// GET /api/hospitals - Get all hospitals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (lat && lng) {
      // Find nearest hospital
      const hospital = await findNearestHospital(parseFloat(lat), parseFloat(lng));
      if (hospital) {
        return NextResponse.json<ApiResponse<typeof hospital>>({
          success: true,
          data: hospital,
        });
      }
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "No hospitals found",
        },
        { status: 404 }
      );
    }

    const hospitals = await getAllHospitals();
    return NextResponse.json<ApiResponse<typeof hospitals>>({
      success: true,
      data: hospitals,
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch hospitals",
      },
      { status: 500 }
    );
  }
}
