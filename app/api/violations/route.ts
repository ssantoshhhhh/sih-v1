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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || undefined
    const severity = searchParams.get("severity") || undefined
    const assignedTo = searchParams.get("assignedTo") || undefined
    const platformId = searchParams.get("platformId") || undefined
    const categoryId = searchParams.get("categoryId") || undefined

    const result = await ViolationService.getViolations({
      page,
      limit,
      status,
      severity,
      assignedTo,
      platformId,
      categoryId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Violations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const violation = await ViolationService.createViolation(body)

    return NextResponse.json(violation, { status: 201 })
  } catch (error) {
    console.error("Create violation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
