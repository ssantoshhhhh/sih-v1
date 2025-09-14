import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ViolationService } from "@/lib/data/violation-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const violation = await ViolationService.getViolationById(id)

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 })
    }

    return NextResponse.json(violation)
  } catch (error) {
    console.error("Get violation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const violation = await ViolationService.updateViolation(id, body)

    return NextResponse.json(violation)
  } catch (error) {
    console.error("Update violation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
