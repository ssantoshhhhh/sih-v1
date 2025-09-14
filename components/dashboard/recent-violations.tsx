"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Violation } from "@/lib/types"

export function RecentViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchViolations() {
      const supabase = createClient()

      try {
        const { data } = await supabase
          .from("violations")
          .select(`
            *,
            product:products(name, url, platform:platforms(name))
          `)
          .order("created_at", { ascending: false })
          .limit(10)

        setViolations(data || [])
      } catch (error) {
        console.error("Error fetching violations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchViolations()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "investigating":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>Latest compliance violations detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Recent Violations
        </CardTitle>
        <CardDescription>Latest compliance violations detected across monitored platforms</CardDescription>
      </CardHeader>
      <CardContent>
        {violations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No violations found. Great job on compliance!</div>
        ) : (
          <div className="space-y-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(violation.severity)}>{violation.severity.toUpperCase()}</Badge>
                      <Badge variant="outline" className={getStatusColor(violation.status)}>
                        {violation.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{violation.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Product: {(violation.product as any)?.name || "Unknown"} • Platform:{" "}
                      {(violation.product as any)?.platform?.name || "Unknown"} •
                      {new Date(violation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(violation.product as any)?.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={(violation.product as any).url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
