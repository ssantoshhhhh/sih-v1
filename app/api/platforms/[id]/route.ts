import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PlatformService } from "@/lib/data/platform-service"
import { AuthService } from "@/lib/auth/auth-service"

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

    const platform = await PlatformService.getPlatformById(id)

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 })
    }

    return NextResponse.json(platform)
  } catch (error) {
    console.error("Get platform error:", error)
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

    // Check if user is admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const platform = await PlatformService.updatePlatform(id, body)

    return NextResponse.json(platform)
  } catch (error) {
    console.error("Update platform error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check if user is admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await PlatformService.deletePlatform(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete platform error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
