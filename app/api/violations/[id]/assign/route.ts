import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ViolationService } from "@/lib/data/violation-service"
import { AuthService } from "@/lib/auth/auth-service"

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

    // Check if user can assign violations (admin only)
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const violation = await ViolationService.assignViolation(id, userId)

    return NextResponse.json(violation)
  } catch (error) {
    console.error("Assign violation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
