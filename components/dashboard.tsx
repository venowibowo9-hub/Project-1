"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BarcodeScannerForm } from "./barcode-scanner-form"
import { UsageTable } from "./usage-table"
import { Loader2, Plus } from 'lucide-react'

export function Dashboard() {
  const [rolls, setRolls] = useState([])
  const [usageData, setUsageData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    roll_id: "",
    machine_number: "",
    pieces_counter: "",
    line_number: "",
    operator_name: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRolls()
    fetchUsageData()
  }, [])

  const fetchRolls = async () => {
    try {
      const response = await fetch("/api/rolls")
      const data = await response.json()
      setRolls(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch rolls", variant: "destructive" })
    }
  }

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/usage")
      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch usage data", variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.roll_id || !formData.machine_number || !formData.pieces_counter) {
      toast({ title: "Error", description: "Please fill Roll, Machine Number, and Pieces Counter", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_id: formData.roll_id,
          machine_number: formData.machine_number,
          pieces_counter: Number.parseInt(formData.pieces_counter),
          line_number: formData.line_number ? Number.parseInt(formData.line_number) : null,
          operator_name: formData.operator_name,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Usage recorded successfully" })
        setFormData({ roll_id: "", machine_number: "", pieces_counter: "", line_number: "", operator_name: "", notes: "" })
        setOpenDialog(false)
        fetchUsageData()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to record usage", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Rolls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rolls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                usageData.filter((u) => {
                  const today = new Date().toDateString()
                  return new Date(u.usage_date).toDateString() === today
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usageData.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Barcode Scanner</CardTitle>
            <CardDescription>Scan or enter barcode to record usage</CardDescription>
          </CardHeader>
          <CardContent>
            <BarcodeScannerForm rolls={rolls} onSuccess={fetchUsageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Entry</CardTitle>
              <CardDescription>Manually record usage</CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Roll Usage</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="roll_id">Roll *</Label>
                    <Select
                      value={formData.roll_id}
                      onValueChange={(val) => setFormData({ ...formData, roll_id: val })}
                    >
                      <SelectTrigger id="roll_id">
                        <SelectValue placeholder="Select a roll" />
                      </SelectTrigger>
                      <SelectContent>
                        {rolls.map((roll: any) => (
                          <SelectItem key={roll.id} value={roll.id}>
                            {roll.roll_name} ({roll.barcode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="machine_number">Machine Number *</Label>
                      <Input
                        id="machine_number"
                        placeholder="M-001"
                        value={formData.machine_number}
                        onChange={(e) => setFormData({ ...formData, machine_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pieces_counter">Pieces Counter *</Label>
                      <Input
                        id="pieces_counter"
                        type="number"
                        placeholder="100"
                        value={formData.pieces_counter}
                        onChange={(e) => setFormData({ ...formData, pieces_counter: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="line_number">Line Number (Optional)</Label>
                    <Input
                      id="line_number"
                      type="number"
                      placeholder="1"
                      value={formData.line_number}
                      onChange={(e) => setFormData({ ...formData, line_number: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="operator_name">Operator Name</Label>
                    <Input
                      id="operator_name"
                      placeholder="John Doe"
                      value={formData.operator_name}
                      onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Any notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Record Usage
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Add usage data manually using the dialog.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>Latest 10 usage records</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageTable data={usageData.slice(0, 10)} onRefresh={fetchUsageData} />
        </CardContent>
      </Card>
    </div>
  )
}
