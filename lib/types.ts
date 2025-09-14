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
  id: string
  platform_id: string
  category_id?: string
  external_id: string
  name: string
  description?: string
  price?: number
  weight?: string
  dimensions?: string
  images?: any
  raw_data?: any
  url?: string
  scraped_at: string
  updated_at: string
  platform?: Platform
  category?: Category
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
