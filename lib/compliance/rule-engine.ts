import type { Product, Category } from "@/lib/types"

export interface ComplianceRule {
  id: string
  name: string
  description: string
  category?: string
  severity: "low" | "medium" | "high" | "critical"
  validator: (product: Product, category?: Category) => ComplianceResult
}

export interface ComplianceResult {
  isCompliant: boolean
  violations: {
    rule: string
    description: string
    severity: "low" | "medium" | "high" | "critical"
    details?: any
  }[]
}

// Legal Metrology Rules based on Indian regulations
export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "weight_declaration",
    name: "Weight Declaration",
    description: "Product must declare accurate weight/quantity as per Legal Metrology Rules 2011",
    severity: "high",
    validator: (product: Product, category?: Category) => {
      const violations = []
      const rules = category?.compliance_rules as any

      // Check if weight is required for this category
      if (rules?.weight_declaration?.required || rules?.net_weight?.required || rules?.net_quantity?.required) {
        if (!product.weight && !product.raw_data?.weight && !product.raw_data?.quantity) {
          violations.push({
            rule: "weight_declaration",
            description: "Missing weight/quantity declaration",
            severity: "high" as const,
            details: { required_by_category: category?.name },
          })
        }

        // Check for vague weight descriptions
        const weightText = product.weight || product.raw_data?.weight || ""
        if (weightText && /approximately|about|around|~/.test(weightText.toLowerCase())) {
          violations.push({
            rule: "weight_declaration",
            description: "Weight declaration contains vague terms (approximately, about, around)",
            severity: "medium" as const,
            details: { declared_weight: weightText },
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "price_display",
    name: "Price Display",
    description: "Maximum Retail Price (MRP) must be clearly displayed",
    severity: "high",
    validator: (product: Product) => {
      const violations = []

      if (!product.price && !product.raw_data?.mrp && !product.raw_data?.price) {
        violations.push({
          rule: "price_display",
          description: "Missing Maximum Retail Price (MRP) declaration",
          severity: "high" as const,
        })
      }

      // Check for price manipulation indicators
      const priceText = product.raw_data?.price_text || ""
      if (priceText && /strike|crossed|original/.test(priceText.toLowerCase())) {
        // This might indicate manipulated pricing
        violations.push({
          rule: "price_display",
          description: "Potential price manipulation detected",
          severity: "medium" as const,
          details: { price_display: priceText },
        })
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "country_of_origin",
    name: "Country of Origin",
    description: "Country of origin must be declared for imported goods",
    severity: "medium",
    validator: (product: Product, category?: Category) => {
      const violations = []
      const rules = category?.compliance_rules as any

      if (rules?.country_of_origin?.required) {
        const hasOrigin =
          product.raw_data?.country_of_origin ||
          product.raw_data?.made_in ||
          product.description?.toLowerCase().includes("made in") ||
          product.description?.toLowerCase().includes("country of origin")

        if (!hasOrigin) {
          violations.push({
            rule: "country_of_origin",
            description: "Missing country of origin declaration",
            severity: "medium" as const,
            details: { required_by_category: category?.name },
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "manufacturer_details",
    name: "Manufacturer Details",
    description: "Manufacturer name and address must be provided",
    severity: "high",
    validator: (product: Product, category?: Category) => {
      const violations = []
      const rules = category?.compliance_rules as any

      if (rules?.manufacturer_details?.required) {
        const hasManufacturer =
          product.raw_data?.manufacturer ||
          product.raw_data?.brand ||
          product.description?.toLowerCase().includes("manufactured by")

        if (!hasManufacturer) {
          violations.push({
            rule: "manufacturer_details",
            description: "Missing manufacturer details",
            severity: "high" as const,
            details: { required_by_category: category?.name },
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "ingredients_list",
    name: "Ingredients List",
    description: "Food products must list ingredients in descending order by weight",
    category: "Food & Beverages",
    severity: "high",
    validator: (product: Product, category?: Category) => {
      const violations = []

      if (category?.name === "Food & Beverages") {
        const hasIngredients =
          product.raw_data?.ingredients || product.description?.toLowerCase().includes("ingredients")

        if (!hasIngredients) {
          violations.push({
            rule: "ingredients_list",
            description: "Missing ingredients list for food product",
            severity: "high" as const,
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "expiry_date",
    name: "Expiry Date",
    description: "Perishable products must display expiry/best before date",
    category: "Food & Beverages",
    severity: "critical",
    validator: (product: Product, category?: Category) => {
      const violations = []

      if (category?.name === "Food & Beverages" || category?.name === "Cosmetics") {
        const hasExpiry =
          product.raw_data?.expiry_date ||
          product.raw_data?.best_before ||
          product.description?.toLowerCase().includes("expiry") ||
          product.description?.toLowerCase().includes("best before")

        if (!hasExpiry) {
          violations.push({
            rule: "expiry_date",
            description: "Missing expiry/best before date",
            severity: "critical" as const,
            details: { category: category?.name },
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "fabric_composition",
    name: "Fabric Composition",
    description: "Textile products must declare fabric composition with percentages",
    category: "Textiles",
    severity: "medium",
    validator: (product: Product, category?: Category) => {
      const violations = []

      if (category?.name === "Textiles") {
        const hasFabricInfo =
          product.raw_data?.fabric_composition ||
          product.raw_data?.material ||
          product.description?.toLowerCase().includes("cotton") ||
          product.description?.toLowerCase().includes("polyester") ||
          product.description?.toLowerCase().includes("%")

        if (!hasFabricInfo) {
          violations.push({
            rule: "fabric_composition",
            description: "Missing fabric composition details",
            severity: "medium" as const,
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "care_instructions",
    name: "Care Instructions",
    description: "Textile products must provide care instructions",
    category: "Textiles",
    severity: "low",
    validator: (product: Product, category?: Category) => {
      const violations = []

      if (category?.name === "Textiles") {
        const hasCareInstructions =
          product.raw_data?.care_instructions ||
          product.description?.toLowerCase().includes("wash") ||
          product.description?.toLowerCase().includes("dry clean") ||
          product.description?.toLowerCase().includes("care")

        if (!hasCareInstructions) {
          violations.push({
            rule: "care_instructions",
            description: "Missing care instructions",
            severity: "low" as const,
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "energy_rating",
    name: "Energy Rating",
    description: "Electronic appliances must display energy efficiency rating",
    category: "Electronics",
    severity: "medium",
    validator: (product: Product, category?: Category) => {
      const violations = []

      if (category?.name === "Electronics") {
        // Check if this is an appliance that requires energy rating
        const isAppliance =
          product.name.toLowerCase().includes("refrigerator") ||
          product.name.toLowerCase().includes("washing machine") ||
          product.name.toLowerCase().includes("air conditioner") ||
          product.name.toLowerCase().includes("television") ||
          product.name.toLowerCase().includes("microwave")

        if (isAppliance) {
          const hasEnergyRating =
            product.raw_data?.energy_rating ||
            product.description?.toLowerCase().includes("star rating") ||
            product.description?.toLowerCase().includes("energy efficient")

          if (!hasEnergyRating) {
            violations.push({
              rule: "energy_rating",
              description: "Missing energy efficiency rating for appliance",
              severity: "medium" as const,
              details: { product_type: "appliance" },
            })
          }
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
  {
    id: "warranty_information",
    name: "Warranty Information",
    description: "Products must clearly state warranty terms and conditions",
    severity: "low",
    validator: (product: Product, category?: Category) => {
      const violations = []
      const rules = category?.compliance_rules as any

      if (rules?.warranty?.required) {
        const hasWarranty =
          product.raw_data?.warranty ||
          product.description?.toLowerCase().includes("warranty") ||
          product.description?.toLowerCase().includes("guarantee")

        if (!hasWarranty) {
          violations.push({
            rule: "warranty_information",
            description: "Missing warranty information",
            severity: "low" as const,
            details: { required_by_category: category?.name },
          })
        }
      }

      return {
        isCompliant: violations.length === 0,
        violations,
      }
    },
  },
]

export class ComplianceEngine {
  private rules: ComplianceRule[]

  constructor(customRules?: ComplianceRule[]) {
    this.rules = customRules || COMPLIANCE_RULES
  }

  /**
   * Evaluate a product against all applicable compliance rules
   */
  evaluateProduct(product: Product, category?: Category): ComplianceResult {
    const allViolations: ComplianceResult["violations"] = []

    for (const rule of this.rules) {
      // Skip category-specific rules if they don't apply
      if (rule.category && category?.name !== rule.category) {
        continue
      }

      const result = rule.validator(product, category)
      if (!result.isCompliant) {
        allViolations.push(...result.violations)
      }
    }

    return {
      isCompliant: allViolations.length === 0,
      violations: allViolations,
    }
  }

  /**
   * Evaluate multiple products in batch
   */
  evaluateProducts(products: Product[], categories: Category[]): Map<string, ComplianceResult> {
    const results = new Map<string, ComplianceResult>()

    for (const product of products) {
      const category = categories.find((c) => c.id === product.category_id)
      const result = this.evaluateProduct(product, category)
      results.set(product.id, result)
    }

    return results
  }

  /**
   * Get rules applicable to a specific category
   */
  getRulesForCategory(categoryName: string): ComplianceRule[] {
    return this.rules.filter((rule) => !rule.category || rule.category === categoryName)
  }

  /**
   * Add custom rule to the engine
   */
  addRule(rule: ComplianceRule): void {
    this.rules.push(rule)
  }

  /**
   * Remove rule from the engine
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((rule) => rule.id !== ruleId)
  }

  /**
   * Get all rules
   */
  getAllRules(): ComplianceRule[] {
    return [...this.rules]
  }
}

// Export singleton instance
export const complianceEngine = new ComplianceEngine()
