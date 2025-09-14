import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CategoryService } from "@/lib/data/category-service"
import { AuthService } from "@/lib/auth/auth-service"

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
    const withStats = searchParams.get("withStats") === "true"

    const categories = withStats
      ? await CategoryService.getCategoriesWithStats()
      : await CategoryService.getCategories()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories API error:", error)
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

    // Check if user is admin
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const category = await CategoryService.createCategory(body)

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
