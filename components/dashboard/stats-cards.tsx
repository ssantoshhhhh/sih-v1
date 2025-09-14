"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalViolations: number
  openViolations: number
  resolvedViolations: number
  productsScanned: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalViolations: 0,
    openViolations: 0,
    resolvedViolations: 0,
    productsScanned: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        // Get violation counts
        const { data: violations } = await supabase.from("violations").select("status")

        const { data: products } = await supabase.from("products").select("id")

        const totalViolations = violations?.length || 0
        const openViolations = violations?.filter((v) => v.status === "open").length || 0
        const resolvedViolations = violations?.filter((v) => v.status === "resolved").length || 0
        const productsScanned = products?.length || 0

        setStats({
          totalViolations,
          openViolations,
          resolvedViolations,
          productsScanned,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: "Total Violations",
      value: stats.totalViolations,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Open Cases",
      value: stats.openViolations,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Resolved",
      value: stats.resolvedViolations,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Products Scanned",
      value: stats.productsScanned,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
