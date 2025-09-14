import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

export class PlatformService {
  /**
   * Get all platforms
   */
  static async getPlatforms(): Promise<Platform[]> {
    const supabase = await createClient()

    const { data: platforms, error } = await supabase.from("platforms").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch platforms: ${error.message}`)
    }

    return platforms || []
  }

  /**
   * Get platform by ID
   */
  static async getPlatformById(id: string): Promise<Platform | null> {
    const supabase = await createClient()

    const { data: platform, error } = await supabase.from("platforms").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Platform not found
      }
      throw new Error(`Failed to fetch platform: ${error.message}`)
    }

    return platform
  }

  /**
   * Create a new platform
   */
  static async createPlatform(platformData: Omit<Platform, "id" | "created_at" | "updated_at">): Promise<Platform> {
    const supabase = await createClient()

    const { data: platform, error } = await supabase
      .from("platforms")
      .insert({
        ...platformData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create platform: ${error.message}`)
    }

    return platform
  }

  /**
   * Update platform
   */
  static async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform> {
    const supabase = await createClient()

    const { data: platform, error } = await supabase
      .from("platforms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update platform: ${error.message}`)
    }

    return platform
  }

  /**
   * Delete platform
   */
  static async deletePlatform(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("platforms").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete platform: ${error.message}`)
    }
  }

  /**
   * Toggle platform active status
   */
  static async togglePlatformStatus(id: string): Promise<Platform> {
    const supabase = await createClient()

    // First get current status
    const { data: currentPlatform } = await supabase.from("platforms").select("is_active").eq("id", id).single()

    if (!currentPlatform) {
      throw new Error("Platform not found")
    }

    // Toggle status
    const { data: platform, error } = await supabase
      .from("platforms")
      .update({
        is_active: !currentPlatform.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to toggle platform status: ${error.message}`)
    }

    return platform
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(platformId: string) {
    const supabase = await createClient()

    // Get product count
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platformId)

    // Get violation count
    const { data: violations } = await supabase
      .from("violations")
      .select("severity, status, products!inner(platform_id)")
      .eq("products.platform_id", platformId)

    const violationStats = {
      total: violations?.length || 0,
      open: violations?.filter((v) => v.status === "open").length || 0,
      critical: violations?.filter((v) => v.severity === "critical").length || 0,
      high: violations?.filter((v) => v.severity === "high").length || 0,
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platformId)
      .gte("scraped_at", sevenDaysAgo.toISOString())

    return {
      productCount: productCount || 0,
      violations: violationStats,
      recentProducts: recentProducts || 0,
    }
  }

  /**
   * Test platform connectivity
   */
  static async testPlatformConnectivity(platformId: string): Promise<{
    success: boolean
    message: string
    responseTime?: number
  }> {
    const platform = await this.getPlatformById(platformId)

    if (!platform) {
      return { success: false, message: "Platform not found" }
    }

    try {
      const startTime = Date.now()
      const response = await fetch(`https://${platform.domain}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      const responseTime = Date.now() - startTime

      if (response.ok) {
        return {
          success: true,
          message: "Platform is accessible",
          responseTime,
        }
      } else {
        return {
          success: false,
          message: `Platform returned ${response.status} ${response.statusText}`,
          responseTime,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      }
    }
  }
}
