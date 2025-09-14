import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ViolationsChart } from "@/components/dashboard/violations-chart"
import { RecentViolations } from "@/components/dashboard/recent-violations"
import { PlatformStatus } from "@/components/dashboard/platform-status"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={userProfile} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <StatsCards />

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationsChart />
            <PlatformStatus />
          </div>

          {/* Recent Activity */}
          <RecentViolations />
        </div>
      </main>
    </div>
  )
}
