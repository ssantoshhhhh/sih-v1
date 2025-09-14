import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AuthService } from "@/lib/auth/auth-service"

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
    const { platformId, productUrls, categoryId } = body

    if (!platformId) {
      return NextResponse.json({ error: "Platform ID required" }, { status: 400 })
    }

    // Get platform details
    const { data: platform } = await supabase.from("platforms").select("*").eq("id", platformId).single()

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 })
    }

    // Simulate scraping process (in a real implementation, this would use actual web scraping)
    const scrapedProducts = await simulateProductScraping(platform, productUrls, categoryId)

    // Insert scraped products
    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(scrapedProducts)
      .select()

    if (insertError) {
      throw new Error(insertError.message)
    }

    return NextResponse.json({
      success: true,
      productsScraped: insertedProducts?.length || 0,
      products: insertedProducts,
    })
  } catch (error) {
    console.error("Scraper API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Simulate product scraping (replace with actual scraping logic)
async function simulateProductScraping(platform: any, productUrls: string[] = [], categoryId?: string) {
  const sampleProducts = [
    {
      platform_id: platform.id,
      category_id: categoryId,
      external_id: `${platform.domain}_${Date.now()}_1`,
      name: "Sample Electronic Device",
      description: "High-quality electronic device with advanced features",
      price: 299.99,
      weight: "500g",
      dimensions: "10x8x2 cm",
      images: ["https://example.com/image1.jpg"],
      raw_data: {
        brand: "TechCorp",
        model: "TC-2024",
        warranty: "1 year",
        energy_rating: "4 star",
      },
      url: productUrls[0] || `https://${platform.domain}/product/sample-1`,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      platform_id: platform.id,
      category_id: categoryId,
      external_id: `${platform.domain}_${Date.now()}_2`,
      name: "Cotton T-Shirt",
      description: "100% cotton comfortable t-shirt",
      price: 19.99,
      weight: "200g",
      dimensions: "Medium size",
      images: ["https://example.com/image2.jpg"],
      raw_data: {
        fabric_composition: "100% Cotton",
        care_instructions: "Machine wash cold",
        size_chart: "S, M, L, XL available",
        country_of_origin: "India",
      },
      url: productUrls[1] || `https://${platform.domain}/product/sample-2`,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Return only the number of products requested or default samples
  return sampleProducts.slice(0, productUrls.length || 2)
}
