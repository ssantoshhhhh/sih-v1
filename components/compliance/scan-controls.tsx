"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Play, RefreshCw, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScanResult {
  success: boolean
  violationsFound: number
  violations: any[]
}

export function ScanControls() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanType, setScanType] = useState("stale")
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const { toast } = useToast()

  const handleScan = async () => {
    setIsScanning(true)

    try {
      const response = await fetch("/api/compliance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanType,
          daysOld: 7, // For stale products
        }),
      })

      const result = await response.json()

      if (result.success) {
        setLastScanResult(result)
        toast({
          title: "Scan Complete",
          description: `Found ${result.violationsFound} violations`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "An error occurred during the compliance scan",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Compliance Scanner
          </CardTitle>
          <CardDescription>Run automated compliance checks on products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stale">Scan Stale Products (7+ days old)</SelectItem>
                  <SelectItem value="all">Scan All Products</SelectItem>
                  <SelectItem value="recent">Scan Recent Products (24 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
          </div>

          {lastScanResult && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Last Scan Results</h4>
                <Badge variant={lastScanResult.violationsFound > 0 ? "destructive" : "default"}>
                  {lastScanResult.violationsFound} violations found
                </Badge>
              </div>

              {lastScanResult.violations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recent violations:</p>
                  {lastScanResult.violations.slice(0, 3).map((violation, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>{violation.description}</span>
                      <Badge variant="outline" className="text-xs">
                        {violation.severity}
                      </Badge>
                    </div>
                  ))}
                  {lastScanResult.violations.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{lastScanResult.violations.length - 3} more violations
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
