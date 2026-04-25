// PRAVAH + LifeLane - Emergency API Routes
import { NextRequest, NextResponse } from "next/server";
import {
  getActiveEmergencies,
  getEmergencyById,
  createEmergency as dbCreateEmergency,
  assignAmbulanceToEmergency,
  updateEmergencyStatus,
  findNearestAmbulance,
  updateAmbulanceStatus,
  createAlert,
} from "@/db/access";
import type { ApiResponse, EmergencyType } from "@/types";

// GET /api/emergencies - Get active emergencies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let emergencies;
    if (status === "active") {
      emergencies = await getActiveEmergencies();
    } else {
      emergencies = await getActiveEmergencies();
    }

    return NextResponse.json<ApiResponse<typeof emergencies>>({
      success: true,
      data: emergencies,
    });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch emergencies",
      },
      { status: 500 }
    );
  }
}

// POST /api/emergencies/sos - Create emergency SOS request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      lat,
      lng,
      patientName,
      patientPhone,
      description,
    } = body;

    // Validate required fields
    if (!userId || !type || !lat || !lng || !patientName) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Create emergency record
    const emergency = await dbCreateEmergency({
      userId,
      patientName,
      patientPhone,
      type: type as EmergencyType,
      description,
      pickupLat: lat,
      pickupLng: lng,
    });

    // Find nearest available ambulance
    const nearestAmbulance = await findNearestAmbulance(lat, lng);

    if (nearestAmbulance) {
      // Assign ambulance
      await assignAmbulanceToEmergency(emergency.id, nearestAmbulance.id);
      await updateAmbulanceStatus(nearestAmbulance.id, "en-route");

      // Create high-priority alert
      await createAlert({
        type: "emergency",
        severity: "critical",
        title: `Emergency: ${type}`,
        message: `${patientName} requires immediate assistance`,
        emergencyId: emergency.id,
        ambulanceId: nearestAmbulance.id,
      });

      return NextResponse.json<ApiResponse<typeof emergency>>({
        success: true,
        data: emergency,
        message: "Ambulance dispatched successfully",
      });
    } else {
      // No ambulance available
      await createAlert({
        type: "emergency",
        severity: "critical",
        title: "No Ambulance Available",
        message: `Emergency ${emergency.id} - No available units`,
        emergencyId: emergency.id,
      });

      return NextResponse.json<ApiResponse<typeof emergency>>({
        success: true,
        data: emergency,
        message: "Emergency created but no ambulance available",
      });
    }
  } catch (error) {
    console.error("Error creating emergency:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to create emergency",
      },
      { status: 500 }
    );
  }
}
