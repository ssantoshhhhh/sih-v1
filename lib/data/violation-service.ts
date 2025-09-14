import { createClient } from "@/lib/supabase/server"
import type { Violation } from "@/lib/types"

export class ViolationService {
  /**
   * Get violations with pagination and filtering
   */
  static async getViolations(
    options: {
      page?: number
      limit?: number
      status?: string
      severity?: string
      assignedTo?: string
      platformId?: string
      categoryId?: string
    } = {},
  ) {
    const supabase = await createClient()
    const { page = 1, limit = 20, status, severity, assignedTo, platformId, categoryId } = options

    let query = supabase
      .from("violations")
      .select(
        `
        *,
        product:products(
          id, name, url,
          platform:platforms(id, name, domain),
          category:categories(id, name)
        ),
        assignee:users(id, full_name, email)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo)
    }

    if (platformId) {
      query = query.eq("products.platform_id", platformId)
    }

    if (categoryId) {
      query = query.eq("products.category_id", categoryId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: violations, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch violations: ${error.message}`)
    }

    return {
      violations: violations || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Get violation by ID
   */
  static async getViolationById(id: string): Promise<Violation | null> {
    const supabase = await createClient()

    const { data: violation, error } = await supabase
      .from("violations")
      .select(
        `
        *,
        product:products(
          *,
          platform:platforms(*),
          category:categories(*)
        ),
        assignee:users(id, full_name, email, department)
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Violation not found
      }
      throw new Error(`Failed to fetch violation: ${error.message}`)
    }

    return violation
  }

  /**
   * Create a new violation
   */
  static async createViolation(
    violationData: Omit<Violation, "id" | "created_at" | "resolved_at">,
  ): Promise<Violation> {
    const supabase = await createClient()

    const { data: violation, error } = await supabase
      .from("violations")
      .insert({
        ...violationData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create violation: ${error.message}`)
    }

    return violation
  }

  /**
   * Update violation
   */
  static async updateViolation(id: string, updates: Partial<Violation>): Promise<Violation> {
    const supabase = await createClient()

    // If status is being changed to resolved, set resolved_at
    if (updates.status === "resolved" && !updates.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    const { data: violation, error } = await supabase.from("violations").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Failed to update violation: ${error.message}`)
    }

    return violation
  }

  /**
   * Assign violation to user
   */
  static async assignViolation(violationId: string, userId: string): Promise<Violation> {
    return this.updateViolation(violationId, {
      assigned_to: userId,
      status: "investigating",
    })
  }

  /**
   * Resolve violation
   */
  static async resolveViolation(violationId: string, notes?: string): Promise<Violation> {
    return this.updateViolation(violationId, {
      status: "resolved",
      resolved_at: new Date().toISOString(),
      notes,
    })
  }

  /**
   * Dismiss violation
   */
  static async dismissViolation(violationId: string, notes?: string): Promise<Violation> {
    return this.updateViolation(violationId, {
      status: "dismissed",
      notes,
    })
  }

  /**
   * Get violation statistics
   */
  static async getViolationStats() {
    const supabase = await createClient()

    const { data: violations } = await supabase.from("violations").select("status, severity, created_at")

    if (!violations) {
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        trend: [],
      }
    }

    // Group by status
    const byStatus = violations.reduce(
      (acc, violation) => {
        acc[violation.status] = (acc[violation.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Group by severity
    const bySeverity = violations.reduce(
      (acc, violation) => {
        acc[violation.severity] = (acc[violation.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Get trend data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentViolations = violations.filter((v) => new Date(v.created_at) >= thirtyDaysAgo)

    const trend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dateStr = date.toISOString().split("T")[0]

      const dayViolations = recentViolations.filter((v) => v.created_at.startsWith(dateStr))

      return {
        date: dateStr,
        count: dayViolations.length,
        critical: dayViolations.filter((v) => v.severity === "critical").length,
        high: dayViolations.filter((v) => v.severity === "high").length,
      }
    })

    return {
      total: violations.length,
      byStatus,
      bySeverity,
      trend,
    }
  }

  /**
   * Get violations by product
   */
  static async getViolationsByProduct(productId: string): Promise<Violation[]> {
    const supabase = await createClient()

    const { data: violations, error } = await supabase
      .from("violations")
      .select(
        `
        *,
        assignee:users(id, full_name, email)
      `,
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch violations by product: ${error.message}`)
    }

    return violations || []
  }

  /**
   * Get violations assigned to user
   */
  static async getViolationsByAssignee(userId: string): Promise<Violation[]> {
    const supabase = await createClient()

    const { data: violations, error } = await supabase
      .from("violations")
      .select(
        `
        *,
        product:products(
          id, name, url,
          platform:platforms(id, name, domain),
          category:categories(id, name)
        )
      `,
      )
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch violations by assignee: ${error.message}`)
    }

    return violations || []
  }

  /**
   * Bulk update violations
   */
  static async bulkUpdateViolations(violationIds: string[], updates: Partial<Violation>): Promise<Violation[]> {
    const supabase = await createClient()

    const { data: violations, error } = await supabase
      .from("violations")
      .update(updates)
      .in("id", violationIds)
      .select()

    if (error) {
      throw new Error(`Failed to bulk update violations: ${error.message}`)
    }

    return violations || []
  }
}
