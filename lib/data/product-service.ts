import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"

export class ProductService {
  /**
   * Get products with pagination and filtering
   */
  static async getProducts(
    options: {
      page?: number
      limit?: number
      platformId?: string
      categoryId?: string
      search?: string
      hasViolations?: boolean
    } = {},
  ) {
    const supabase = await createClient()
    const { page = 1, limit = 20, platformId, categoryId, search, hasViolations } = options

    let query = supabase
      .from("products")
      .select(
        `
        *,
        platform:platforms(id, name, domain),
        category:categories(id, name),
        violations:violations(id, severity, status)
      `,
        { count: "exact" },
      )
      .order("scraped_at", { ascending: false })

    // Apply filters
    if (platformId) {
      query = query.eq("platform_id", platformId)
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    // Filter by violations if requested
    let filteredProducts = products || []
    if (hasViolations !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const hasViolationsCount = (product.violations as any[])?.length > 0
        return hasViolations ? hasViolationsCount : !hasViolationsCount
      })
    }

    return {
      products: filteredProducts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Get a single product by ID with full details
   */
  static async getProductById(id: string): Promise<Product | null> {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        platform:platforms(*),
        category:categories(*),
        violations:violations(
          *,
          assignee:users(id, full_name, email)
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Product not found
      }
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return product
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: Omit<Product, "id" | "scraped_at" | "updated_at">): Promise<Product> {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`)
    }

    return product
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`)
    }

    return product
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`)
    }
  }

  /**
   * Get products by platform
   */
  static async getProductsByPlatform(platformId: string, limit = 50): Promise<Product[]> {
    const supabase = await createClient()

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, name)
      `,
      )
      .eq("platform_id", platformId)
      .order("scraped_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch products by platform: ${error.message}`)
    }

    return products || []
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId: string, limit = 50): Promise<Product[]> {
    const supabase = await createClient()

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        platform:platforms(id, name, domain)
      `,
      )
      .eq("category_id", categoryId)
      .order("scraped_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch products by category: ${error.message}`)
    }

    return products || []
  }

  /**
   * Search products with advanced filters
   */
  static async searchProducts(
    searchTerm: string,
    filters: {
      platformIds?: string[]
      categoryIds?: string[]
      priceRange?: { min: number; max: number }
      hasViolations?: boolean
      violationSeverity?: string[]
    } = {},
  ) {
    const supabase = await createClient()

    let query = supabase
      .from("products")
      .select(
        `
        *,
        platform:platforms(id, name, domain),
        category:categories(id, name),
        violations:violations(id, severity, status)
      `,
      )
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

    // Apply platform filter
    if (filters.platformIds && filters.platformIds.length > 0) {
      query = query.in("platform_id", filters.platformIds)
    }

    // Apply category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query = query.in("category_id", filters.categoryIds)
    }

    // Apply price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        query = query.gte("price", filters.priceRange.min)
      }
      if (filters.priceRange.max > 0) {
        query = query.lte("price", filters.priceRange.max)
      }
    }

    query = query.order("scraped_at", { ascending: false }).limit(100)

    const { data: products, error } = await query

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`)
    }

    let results = products || []

    // Post-process filters that require client-side filtering
    if (filters.hasViolations !== undefined) {
      results = results.filter((product) => {
        const hasViolationsCount = (product.violations as any[])?.length > 0
        return filters.hasViolations ? hasViolationsCount : !hasViolationsCount
      })
    }

    if (filters.violationSeverity && filters.violationSeverity.length > 0) {
      results = results.filter((product) => {
        const violations = product.violations as any[]
        return violations?.some((v) => filters.violationSeverity!.includes(v.severity))
      })
    }

    return results
  }

  /**
   * Get product statistics
   */
  static async getProductStats() {
    const supabase = await createClient()

    // Get total products
    const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

    // Get products by platform
    const { data: platformStats } = await supabase
      .from("products")
      .select("platform_id, platform:platforms(name)")
      .order("platform_id")

    // Get products by category
    const { data: categoryStats } = await supabase
      .from("products")
      .select("category_id, category:categories(name)")
      .order("category_id")

    // Group by platform
    const platformCounts = platformStats?.reduce(
      (acc, product) => {
        const platformName = (product.platform as any)?.name || "Unknown"
        acc[platformName] = (acc[platformName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Group by category
    const categoryCounts = categoryStats?.reduce(
      (acc, product) => {
        const categoryName = (product.category as any)?.name || "Uncategorized"
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalProducts: totalProducts || 0,
      byPlatform: platformCounts || {},
      byCategory: categoryCounts || {},
    }
  }

  /**
   * Bulk import products
   */
  static async bulkImportProducts(products: Omit<Product, "id" | "scraped_at" | "updated_at">[]): Promise<Product[]> {
    const supabase = await createClient()

    const productsWithTimestamps = products.map((product) => ({
      ...product,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: importedProducts, error } = await supabase.from("products").insert(productsWithTimestamps).select()

    if (error) {
      throw new Error(`Failed to bulk import products: ${error.message}`)
    }

    return importedProducts || []
  }
}
