import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get comprehensive dashboard statistics
    const [
      { count: totalProducts },
      { count: totalViolations },
      { data: violations },
      { count: totalPlatforms },
      { data: platforms },
      { count: recentProducts },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("violations").select("*", { count: "exact", head: true }),
      supabase.from("violations").select("status, severity, created_at"),
      supabase.from("platforms").select("*", { count: "exact", head: true }),
      supabase.from("platforms").select("is_active"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .gte("scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Process violation statistics
    const openViolations = violations?.filter((v) => v.status === "open").length || 0
    const resolvedViolations = violations?.filter((v) => v.status === "resolved").length || 0
    const criticalViolations = violations?.filter((v) => v.severity === "critical").length || 0
    const highViolations = violations?.filter((v) => v.severity === "high").length || 0

    // Process platform statistics
    const activePlatforms = platforms?.filter((p) => p.is_active).length || 0

    // Get trend data for the last 7 days
    const trendData = await getTrendData(supabase)

    const stats = {
      overview: {
        totalProducts: totalProducts || 0,
        totalViolations: totalViolations || 0,
        openViolations,
        resolvedViolations,
        criticalViolations,
        highViolations,
        totalPlatforms: totalPlatforms || 0,
        activePlatforms,
        recentProducts: recentProducts || 0,
      },
      trends: trendData,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getTrendData(supabase: any) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()

  const trendData = await Promise.all(
    last7Days.map(async (date) => {
      const [{ count: products }, { data: violations }] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .gte("scraped_at", date)
          .lt("scraped_at", `${date}T23:59:59`),
        supabase.from("violations").select("severity").gte("created_at", date).lt("created_at", `${date}T23:59:59`),
      ])

      return {
        date,
        products: products || 0,
        violations: violations?.length || 0,
        critical: violations?.filter((v) => v.severity === "critical").length || 0,
        high: violations?.filter((v) => v.severity === "high").length || 0,
      }
    }),
  )

  return trendData
}
