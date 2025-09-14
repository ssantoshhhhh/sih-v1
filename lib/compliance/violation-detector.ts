import { createClient } from "@/lib/supabase/server"
import { complianceEngine } from "./rule-engine"
import type { Violation } from "@/lib/types"

export class ViolationDetector {
  /**
   * Scan a single product for compliance violations
   */
  static async scanProduct(productId: string): Promise<Violation[]> {
    const supabase = await createClient()

    // Get product with category
    const { data: product } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("id", productId)
      .single()

    if (!product) {
      throw new Error("Product not found")
    }

    // Evaluate compliance
    const result = complianceEngine.evaluateProduct(product, product.category)

    // Create violation records
    const violations: Violation[] = []
    for (const violation of result.violations) {
      const violationRecord = {
        id: crypto.randomUUID(),
        product_id: productId,
        rule_type: violation.rule,
        severity: violation.severity,
        description: violation.description,
        details: violation.details,
        status: "open" as const,
        created_at: new Date().toISOString(),
      }

      // Insert into database
      const { data: insertedViolation } = await supabase.from("violations").insert(violationRecord).select().single()

      if (insertedViolation) {
        violations.push(insertedViolation)
      }
    }

    return violations
  }

  /**
   * Scan multiple products for violations
   */
  static async scanProducts(productIds: string[]): Promise<Map<string, Violation[]>> {
    const results = new Map<string, Violation[]>()

    for (const productId of productIds) {
      try {
        const violations = await this.scanProduct(productId)
        results.set(productId, violations)
      } catch (error) {
        console.error(`Error scanning product ${productId}:`, error)
        results.set(productId, [])
      }
    }

    return results
  }

  /**
   * Scan all products from a specific platform
   */
  static async scanPlatform(platformId: string): Promise<Violation[]> {
    const supabase = await createClient()

    // Get all products from platform
    const { data: products } = await supabase.from("products").select("id").eq("platform_id", platformId)

    if (!products) {
      return []
    }

    const productIds = products.map((p) => p.id)
    const results = await this.scanProducts(productIds)

    // Flatten all violations
    const allViolations: Violation[] = []
    for (const violations of results.values()) {
      allViolations.push(...violations)
    }

    return allViolations
  }

  /**
   * Re-scan products that haven't been checked recently
   */
  static async scanStaleProducts(daysOld = 7): Promise<Violation[]> {
    const supabase = await createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Get products that haven't been scanned recently
    const { data: products } = await supabase.from("products").select("id").lt("updated_at", cutoffDate.toISOString())

    if (!products) {
      return []
    }

    const productIds = products.map((p) => p.id)
    const results = await this.scanProducts(productIds)

    // Flatten all violations
    const allViolations: Violation[] = []
    for (const violations of results.values()) {
      allViolations.push(...violations)
    }

    return allViolations
  }

  /**
   * Get compliance summary for a product
   */
  static async getProductComplianceSummary(productId: string) {
    const supabase = await createClient()

    const { data: violations } = await supabase.from("violations").select("*").eq("product_id", productId)

    const summary = {
      total: violations?.length || 0,
      open: violations?.filter((v) => v.status === "open").length || 0,
      resolved: violations?.filter((v) => v.status === "resolved").length || 0,
      critical: violations?.filter((v) => v.severity === "critical").length || 0,
      high: violations?.filter((v) => v.severity === "high").length || 0,
      medium: violations?.filter((v) => v.severity === "medium").length || 0,
      low: violations?.filter((v) => v.severity === "low").length || 0,
    }

    return summary
  }
}
