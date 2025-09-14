"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const chartConfig = {
  violations: {
    label: "Violations",
    color: "hsl(var(--chart-1))",
  },
}

export function ViolationsChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      const supabase = createClient()

      try {
        const { data: violations } = await supabase
          .from("violations")
          .select("created_at, severity")
          .order("created_at", { ascending: false })
          .limit(100)

        // Group by day for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        }).reverse()

        const chartData = last7Days.map((date) => {
          const dayViolations = violations?.filter((v) => v.created_at.startsWith(date)) || []

          return {
            date: new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            violations: dayViolations.length,
            critical: dayViolations.filter((v) => v.severity === "critical").length,
            high: dayViolations.filter((v) => v.severity === "high").length,
          }
        })

        setData(chartData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Violations Trend</CardTitle>
        <CardDescription>Daily violation counts for the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="violations" fill="var(--color-violations)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
