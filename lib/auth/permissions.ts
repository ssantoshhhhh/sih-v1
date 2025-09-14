import type { User } from "@/lib/types"

export enum Permission {
  // Product permissions
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCTS = "create_products",
  UPDATE_PRODUCTS = "update_products",
  DELETE_PRODUCTS = "delete_products",

  // Violation permissions
  VIEW_VIOLATIONS = "view_violations",
  CREATE_VIOLATIONS = "create_violations",
  UPDATE_VIOLATIONS = "update_violations",
  ASSIGN_VIOLATIONS = "assign_violations",
  RESOLVE_VIOLATIONS = "resolve_violations",

  // Platform permissions
  VIEW_PLATFORMS = "view_platforms",
  MANAGE_PLATFORMS = "manage_platforms",

  // Category permissions
  VIEW_CATEGORIES = "view_categories",
  MANAGE_CATEGORIES = "manage_categories",

  // User management permissions
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Report permissions
  VIEW_REPORTS = "view_reports",
  CREATE_REPORTS = "create_reports",
  EXPORT_REPORTS = "export_reports",

  // System permissions
  MANAGE_RULES = "manage_rules",
  SYSTEM_SETTINGS = "system_settings",
  AUDIT_LOGS = "audit_logs",
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  officer: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_VIOLATIONS,
    Permission.UPDATE_VIOLATIONS,
    Permission.RESOLVE_VIOLATIONS,
    Permission.VIEW_PLATFORMS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  admin: [
    // All officer permissions
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_VIOLATIONS,
    Permission.UPDATE_VIOLATIONS,
    Permission.RESOLVE_VIOLATIONS,
    Permission.VIEW_PLATFORMS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.EXPORT_REPORTS,
    // Plus admin-specific permissions
    Permission.CREATE_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.CREATE_VIOLATIONS,
    Permission.ASSIGN_VIOLATIONS,
    Permission.MANAGE_PLATFORMS,
    Permission.MANAGE_CATEGORIES,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_RULES,
    Permission.SYSTEM_SETTINGS,
    Permission.AUDIT_LOGS,
  ],
}

export class PermissionService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false

    const userPermissions = ROLE_PERMISSIONS[user.role] || []
    return userPermissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false

    return permissions.some((permission) => this.hasPermission(user, permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false

    return permissions.every((permission) => this.hasPermission(user, permission))
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(user: User | null): Permission[] {
    if (!user) return []

    return ROLE_PERMISSIONS[user.role] || []
  }

  /**
   * Check if user can access a resource
   */
  static canAccessResource(user: User | null, resource: string, action: string): boolean {
    if (!user) return false

    const permission = `${action}_${resource}` as Permission
    return this.hasPermission(user, permission)
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: User | null): boolean {
    return this.hasPermission(user, Permission.MANAGE_USERS)
  }

  /**
   * Check if user can assign violations
   */
  static canAssignViolations(user: User | null): boolean {
    return this.hasPermission(user, Permission.ASSIGN_VIOLATIONS)
  }

  /**
   * Check if user can manage system settings
   */
  static canManageSystem(user: User | null): boolean {
    return this.hasPermission(user, Permission.SYSTEM_SETTINGS)
  }
}
