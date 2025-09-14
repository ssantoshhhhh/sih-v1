"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth/auth-service"
import { PermissionService, type Permission } from "@/lib/auth/permissions"
import type { User } from "@/lib/types"

interface RoleGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: ("officer" | "admin")[]
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function RoleGuard({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  loading = <div className="animate-pulse h-4 w-20 bg-muted rounded"></div>,
}: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await AuthService.getCurrentUserClient()
        setUser(currentUser)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  if (isLoading) {
    return <>{loading}</>
  }

  if (!user) {
    return <>{fallback}</>
  }

  // Check role requirements
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasPermissions = PermissionService.hasAllPermissions(user, permissions)
    if (!hasPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
