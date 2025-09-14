"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Platform } from "@/lib/types"

export function PlatformStatus() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlatforms() {
      const supabase = createClient()

      try {
        const { data } = await supabase.from("platforms").select("*").order("name")

        setPlatforms(data || [])
      } catch (error) {
        console.error("Error fetching platforms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Status</CardTitle>
          <CardDescription>Monitoring status of e-commerce platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
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
        <CardTitle>Platform Status</CardTitle>
        <CardDescription>Monitoring status of e-commerce platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {platform.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{platform.name}</p>
                  <p className="text-xs text-muted-foreground">{platform.domain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={platform.is_active ? "default" : "secondary"}
                  className={platform.is_active ? "bg-green-100 text-green-800" : ""}
                >
                  {platform.is_active ? "Active" : "Inactive"}
                </Badge>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
