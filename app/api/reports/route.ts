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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("reports")
      .select(
        `
        *,
        generator:users(id, full_name, email)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (type) {
      query = query.eq("type", type)
    }

    const { data: reports, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(reports || [])
  } catch (error) {
    console.error("Reports API error:", error)
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
    const { title, type, dateRangeStart, dateRangeEnd } = body

    // Generate report data based on type
    let reportData = {}

    switch (type) {
      case "daily":
        reportData = await generateDailyReport(supabase)
        break
      case "weekly":
        reportData = await generateWeeklyReport(supabase)
        break
      case "monthly":
        reportData = await generateMonthlyReport(supabase)
        break
      case "custom":
        reportData = await generateCustomReport(supabase, dateRangeStart, dateRangeEnd)
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        title,
        type,
        generated_by: user.id,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
        data: reportData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateDailyReport(supabase: any) {
  const today = new Date().toISOString().split("T")[0]

  const [{ count: productsScanned }, { data: violations }, { data: platforms }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).gte("scraped_at", today),
    supabase.from("violations").select("severity, status").gte("created_at", today),
    supabase.from("platforms").select("name, is_active"),
  ])

  return {
    date: today,
    productsScanned: productsScanned || 0,
    violations: {
      total: violations?.length || 0,
      critical: violations?.filter((v: any) => v.severity === "critical").length || 0,
      high: violations?.filter((v: any) => v.severity === "high").length || 0,
      open: violations?.filter((v: any) => v.status === "open").length || 0,
    },
    platforms: {
      total: platforms?.length || 0,
      active: platforms?.filter((p: any) => p.is_active).length || 0,
    },
  }
}

async function generateWeeklyReport(supabase: any) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()

  const [{ count: productsScanned }, { data: violations }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).gte("scraped_at", weekAgoStr),
    supabase.from("violations").select("severity, status, created_at").gte("created_at", weekAgoStr),
  ])

  return {
    period: "last_7_days",
    productsScanned: productsScanned || 0,
    violations: {
      total: violations?.length || 0,
      critical: violations?.filter((v: any) => v.severity === "critical").length || 0,
      high: violations?.filter((v: any) => v.severity === "high").length || 0,
      resolved: violations?.filter((v: any) => v.status === "resolved").length || 0,
    },
  }
}

async function generateMonthlyReport(supabase: any) {
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthAgoStr = monthAgo.toISOString()

  const [{ count: productsScanned }, { data: violations }, { data: platforms }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).gte("scraped_at", monthAgoStr),
    supabase.from("violations").select("severity, status, created_at").gte("created_at", monthAgoStr),
    supabase.from("platforms").select("name, is_active"),
  ])

  return {
    period: "last_30_days",
    productsScanned: productsScanned || 0,
    violations: {
      total: violations?.length || 0,
      bySeverity: {
        critical: violations?.filter((v: any) => v.severity === "critical").length || 0,
        high: violations?.filter((v: any) => v.severity === "high").length || 0,
        medium: violations?.filter((v: any) => v.severity === "medium").length || 0,
        low: violations?.filter((v: any) => v.severity === "low").length || 0,
      },
      byStatus: {
        open: violations?.filter((v: any) => v.status === "open").length || 0,
        investigating: violations?.filter((v: any) => v.status === "investigating").length || 0,
        resolved: violations?.filter((v: any) => v.status === "resolved").length || 0,
        dismissed: violations?.filter((v: any) => v.status === "dismissed").length || 0,
      },
    },
    platforms: {
      total: platforms?.length || 0,
      active: platforms?.filter((p: any) => p.is_active).length || 0,
    },
  }
}

async function generateCustomReport(supabase: any, startDate: string, endDate: string) {
  const [{ count: productsScanned }, { data: violations }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gte("scraped_at", startDate)
      .lte("scraped_at", endDate),
    supabase
      .from("violations")
      .select("severity, status, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate),
  ])

  return {
    period: `${startDate}_to_${endDate}`,
    productsScanned: productsScanned || 0,
    violations: {
      total: violations?.length || 0,
      bySeverity: {
        critical: violations?.filter((v: any) => v.severity === "critical").length || 0,
        high: violations?.filter((v: any) => v.severity === "high").length || 0,
        medium: violations?.filter((v: any) => v.severity === "medium").length || 0,
        low: violations?.filter((v: any) => v.severity === "low").length || 0,
      },
      byStatus: {
        open: violations?.filter((v: any) => v.status === "open").length || 0,
        investigating: violations?.filter((v: any) => v.status === "investigating").length || 0,
        resolved: violations?.filter((v: any) => v.status === "resolved").length || 0,
        dismissed: violations?.filter((v: any) => v.status === "dismissed").length || 0,
      },
    },
  }
}
