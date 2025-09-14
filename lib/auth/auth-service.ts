import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

export class AuthService {
  /**
   * Get current user from server-side
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient()

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    if (error || !authUser) {
      return null
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

    return userProfile
  }

  /**
   * Get current user from client-side
   */
  static async getCurrentUserClient(): Promise<User | null> {
    const supabase = createBrowserClient()

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    if (error || !authUser) {
      return null
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

    return userProfile
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign up new user
   */
  static async signUp(userData: {
    email: string
    password: string
    fullName: string
    department: string
    role: "officer" | "admin"
  }) {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        data: {
          full_name: userData.fullName,
          department: userData.department,
          role: userData.role,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign out
   */
  static async signOut() {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(userId?: string): Promise<boolean> {
    if (!userId) {
      const user = await this.getCurrentUser()
      if (!user) return false
      userId = user.id
    }

    const supabase = await createClient()
    const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

    return user?.role === "admin"
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    const supabase = await createClient()

    // Check if current user is admin
    const currentUser = await this.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return users || []
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: {
    email: string
    fullName: string
    department: string
    role: "officer" | "admin"
    temporaryPassword: string
  }) {
    const supabase = await createClient()

    // Check if current user is admin
    const currentUser = await this.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Create auth user using service role
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.temporaryPassword,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        full_name: userData.fullName,
        department: userData.department,
        role: userData.role,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string) {
    const supabase = await createClient()

    // Check if current user is admin
    const currentUser = await this.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Don't allow deleting self
    if (currentUser.id === userId) {
      throw new Error("Cannot delete your own account")
    }

    // Delete from auth (this will cascade to users table)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, role: "officer" | "admin") {
    const supabase = await createClient()

    // Check if current user is admin
    const currentUser = await this.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(userId: string, limit = 50) {
    const supabase = await createClient()

    // Get violations assigned to user
    const { data: violations } = await supabase
      .from("violations")
      .select(
        `
        id, description, status, created_at, updated_at,
        product:products(name)
      `,
      )
      .eq("assigned_to", userId)
      .order("updated_at", { ascending: false })
      .limit(limit)

    // Get reports generated by user
    const { data: reports } = await supabase
      .from("reports")
      .select("id, title, type, created_at")
      .eq("generated_by", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    return {
      violations: violations || [],
      reports: reports || [],
    }
  }
}
