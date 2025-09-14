"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth/auth-service"
import { PermissionService, type Permission } from "@/lib/auth/permissions"
import type { User } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireAdmin = false,
  fallback = <div>Access denied</div>,
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await AuthService.getCurrentUserClient()
        setUser(currentUser)

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        // Check admin requirement
        if (requireAdmin && currentUser.role !== "admin") {
          setLoading(false)
          return
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermissions = PermissionService.hasAllPermissions(currentUser, requiredPermissions)
          if (!hasPermissions) {
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredPermissions, requireAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Check admin requirement
  if (requireAdmin && user.role !== "admin") {
    return fallback
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermissions = PermissionService.hasAllPermissions(user, requiredPermissions)
    if (!hasPermissions) {
      return fallback
    }
  }

  return <>{children}</>
}
