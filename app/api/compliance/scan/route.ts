import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ViolationDetector } from "@/lib/compliance/violation-detector"

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
    const { productIds, platformId, scanType = "products" } = body

    let violations: any[] = []

    switch (scanType) {
      case "products":
        if (!productIds || !Array.isArray(productIds)) {
          return NextResponse.json({ error: "Product IDs required" }, { status: 400 })
        }
        const results = await ViolationDetector.scanProducts(productIds)
        violations = Array.from(results.values()).flat()
        break

      case "platform":
        if (!platformId) {
          return NextResponse.json({ error: "Platform ID required" }, { status: 400 })
        }
        violations = await ViolationDetector.scanPlatform(platformId)
        break

      case "stale":
        const daysOld = body.daysOld || 7
        violations = await ViolationDetector.scanStaleProducts(daysOld)
        break

      default:
        return NextResponse.json({ error: "Invalid scan type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      violationsFound: violations.length,
      violations: violations.slice(0, 10), // Return first 10 for preview
    })
  } catch (error) {
    console.error("Compliance scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const summary = await ViolationDetector.getProductComplianceSummary(productId)

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error("Compliance summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
