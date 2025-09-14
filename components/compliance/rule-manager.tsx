"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Plus, Settings, Trash2 } from "lucide-react"
import { complianceEngine, type ComplianceRule } from "@/lib/compliance/rule-engine"

export function RuleManager() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState<Partial<ComplianceRule>>({
    name: "",
    description: "",
    severity: "medium",
    category: "",
  })

  useEffect(() => {
    setRules(complianceEngine.getAllRules())
  }, [])

  const handleAddRule = () => {
    if (!newRule.name || !newRule.description) return

    const rule: ComplianceRule = {
      id: `custom_${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      severity: newRule.severity as any,
      category: newRule.category || undefined,
      validator: () => ({ isCompliant: true, violations: [] }), // Placeholder validator
    }

    complianceEngine.addRule(rule)
    setRules(complianceEngine.getAllRules())
    setNewRule({ name: "", description: "", severity: "medium", category: "" })
    setIsAddDialogOpen(false)
  }

  const handleRemoveRule = (ruleId: string) => {
    complianceEngine.removeRule(ruleId)
    setRules(complianceEngine.getAllRules())
  }

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

  const categories = ["Electronics", "Textiles", "Food & Beverages", "Cosmetics"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Rules</h2>
          <p className="text-muted-foreground">Manage legal metrology compliance rules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Compliance Rule</DialogTitle>
              <DialogDescription>Create a new compliance rule for product validation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Weight Declaration"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe what this rule validates..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newRule.severity}
                  onValueChange={(value) => setNewRule({ ...newRule, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={newRule.category} onValueChange={(value) => setNewRule({ ...newRule, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRule}>Add Rule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(rule.severity)}>{rule.severity.toUpperCase()}</Badge>
                  {rule.category && <Badge variant="outline">{rule.category}</Badge>}
                  {rule.id.startsWith("custom_") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No compliance rules configured</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
