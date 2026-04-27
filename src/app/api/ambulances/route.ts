// PRAVAH + LifeLane - Ambulance API Routes
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

// GET /api/ambulances - Get all ambulances
export async function GET() {
  try {
    const { data: ambulances, error } = await supabase
      .from('ambulances')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json<ApiResponse<typeof ambulances>>({
      success: true,
      data: ambulances,
    });
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch ambulances",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/ambulances/:id/location - Update ambulance location
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, lat, lng, heading, speed, status } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Ambulance ID is required",
        },
        { status: 400 }
      );
    }

    // Update status if provided
    if (status) {
      const { data, error } = await supabase
        .from('ambulances')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json<ApiResponse<typeof data>>({
        success: true,
        data,
      });
    }

    // For location updates, get current ambulance data
    const { data: ambulance, error } = await supabase
      .from('ambulances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<typeof ambulance>>({
      success: true,
      data: ambulance,
      message: "Ambulance updated successfully",
    });
  } catch (error) {
    console.error("Error updating ambulance:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to update ambulance",
      },
      { status: 500 }
    );
  }
}
