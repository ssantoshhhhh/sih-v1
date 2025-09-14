import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ViolationService } from "@/lib/data/violation-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await ViolationService.getViolationStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Violation stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
