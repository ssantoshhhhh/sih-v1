import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PlatformService } from "@/lib/data/platform-service"

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

    const result = await PlatformService.testPlatformConnectivity(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Platform test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
