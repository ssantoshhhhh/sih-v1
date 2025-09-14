export interface User {
  id: string
  email: string
  full_name?: string
  role: "officer" | "admin"
  department?: string
  created_at: string
  updated_at: string
}

export interface Platform {
  id: string
  name: string
  domain: string
  api_endpoint?: string
  scraping_config: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  compliance_rules: any
  created_at: string
}

export interface Product {
  product_id: string
  product_name: string
  brand: string
  source: string
  source_url?: string
  image_url: string
  compliance_status: "Compliant" | "Non-Compliant" | "Pending"
  violation_count: number
  last_checked_at: string
  extracted_data: {
    mrp?: string
    net_quantity?: string
    manufacturer_details?: string
    country_of_origin?: string
    customer_care_contact?: string
  }
  violations: ProductViolation[]
}

export interface ProductViolation {
  rule_id: string
  description: string
  severity: "High" | "Medium" | "Low"
}

export interface ApiResponse<T> {
  metadata: {
    total_items: number
    current_page: number
    items_per_page: number
    total_pages: number
  }
  data: T[]
}

export interface Violation {
  id: string
  product_id: string
  rule_type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  details?: any
  status: "open" | "investigating" | "resolved" | "dismissed"
  assigned_to?: string
  created_at: string
  resolved_at?: string
  notes?: string
  product?: Product
  assignee?: User
}

export interface Report {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly" | "custom"
  generated_by: string
  date_range_start?: string
  date_range_end?: string
  data?: any
  created_at: string
  generator?: User
}
