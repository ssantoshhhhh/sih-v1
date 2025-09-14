import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ViolationService } from "@/lib/data/violation-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { notes } = body

    const violation = await ViolationService.resolveViolation(id, notes)

    return NextResponse.json(violation)
  } catch (error) {
    console.error("Resolve violation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
