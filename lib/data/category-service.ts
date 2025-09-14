import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    const supabase = await createClient()

    const { data: categories, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return categories || []
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string): Promise<Category | null> {
    const supabase = await createClient()

    const { data: category, error } = await supabase.from("categories").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Category not found
      }
      throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return category
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: Omit<Category, "id" | "created_at">): Promise<Category> {
    const supabase = await createClient()

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        ...categoryData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    return category
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const supabase = await createClient()

    const { data: category, error } = await supabase.from("categories").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    return category
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }
  }

  /**
   * Get category with product count
   */
  static async getCategoriesWithStats(): Promise<
    (Category & {
      productCount: number
      violationCount: number
    })[]
  > {
    const supabase = await createClient()

    const { data: categories, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    // Get product counts for each category
    const categoriesWithStats = await Promise.all(
      (categories || []).map(async (category) => {
        // Get product count
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)

        // Get violation count for this category
        const { data: violations } = await supabase
          .from("violations")
          .select("id, products!inner(category_id)")
          .eq("products.category_id", category.id)

        return {
          ...category,
          productCount: productCount || 0,
          violationCount: violations?.length || 0,
        }
      }),
    )

    return categoriesWithStats
  }

  /**
   * Get compliance rules for category
   */
  static async getCategoryComplianceRules(categoryId: string): Promise<any> {
    const category = await this.getCategoryById(categoryId)
    return category?.compliance_rules || {}
  }

  /**
   * Update compliance rules for category
   */
  static async updateCategoryComplianceRules(categoryId: string, rules: any): Promise<Category> {
    const supabase = await createClient()

    const { data: category, error } = await supabase
      .from("categories")
      .update({ compliance_rules: rules })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update category compliance rules: ${error.message}`)
    }

    return category
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(categoryId: string) {
    const supabase = await createClient()

    // Get product count
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)

    // Get violations for this category
    const { data: violations } = await supabase
      .from("violations")
      .select("severity, status, products!inner(category_id)")
      .eq("products.category_id", categoryId)

    const violationStats = {
      total: violations?.length || 0,
      open: violations?.filter((v) => v.status === "open").length || 0,
      resolved: violations?.filter((v) => v.status === "resolved").length || 0,
      critical: violations?.filter((v) => v.severity === "critical").length || 0,
      high: violations?.filter((v) => v.severity === "high").length || 0,
      medium: violations?.filter((v) => v.severity === "medium").length || 0,
      low: violations?.filter((v) => v.severity === "low").length || 0,
    }

    // Get platforms that have products in this category
    const { data: platformData } = await supabase
      .from("products")
      .select("platform:platforms(id, name)")
      .eq("category_id", categoryId)

    const uniquePlatforms = platformData?.reduce(
      (acc, product) => {
        const platform = product.platform as any
        if (platform && !acc.find((p) => p.id === platform.id)) {
          acc.push(platform)
        }
        return acc
      },
      [] as { id: string; name: string }[],
    )

    return {
      productCount: productCount || 0,
      violations: violationStats,
      platforms: uniquePlatforms || [],
    }
  }
}
