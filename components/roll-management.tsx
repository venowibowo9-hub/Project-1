"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Trash2, Plus } from "lucide-react"

interface Roll {
  id: string
  barcode: string
  roll_name: string
  width_mm: number
  length_m: number
  weight_kg: number
  supplier: string
  status: string
  created_at: string
}

export function RollManagement() {
  const [rolls, setRolls] = useState<Roll[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    barcode: "",
    roll_name: "",
    width_mm: "",
    length_m: "",
    weight_kg: "",
    supplier: "",
    status: "active",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRolls()
  }, [])

  const fetchRolls = async () => {
    try {
      const response = await fetch("/api/rolls")
      const data = await response.json()
      setRolls(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch rolls", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (roll?: Roll) => {
    if (roll) {
      setEditingId(roll.id)
      setFormData({
        barcode: roll.barcode,
        roll_name: roll.roll_name,
        width_mm: roll.width_mm.toString(),
        length_m: roll.length_m.toString(),
        weight_kg: roll.weight_kg.toString(),
        supplier: roll.supplier,
        status: roll.status,
      })
    } else {
      setEditingId(null)
      setFormData({
        barcode: "",
        roll_name: "",
        width_mm: "",
        length_m: "",
        weight_kg: "",
        supplier: "",
        status: "active",
      })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.barcode || !formData.roll_name) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      width_mm: formData.width_mm ? Number.parseInt(formData.width_mm) : null,
      length_m: formData.length_m ? Number.parseFloat(formData.length_m) : null,
      weight_kg: formData.weight_kg ? Number.parseFloat(formData.weight_kg) : null,
    }

    try {
      if (editingId) {
        const response = await fetch(`/api/rolls/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (response.ok) {
          toast({ title: "Success", description: "Roll updated successfully" })
        }
      } else {
        const response = await fetch("/api/rolls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (response.ok) {
          toast({ title: "Success", description: "Roll added successfully" })
        }
      }
      setOpenDialog(false)
      fetchRolls()
    } catch (error) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roll?")) return

    try {
      const response = await fetch(`/api/rolls/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Success", description: "Roll deleted successfully" })
        fetchRolls()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete roll", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roll Management</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Roll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Roll" : "Add New Roll"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barcode">Barcode *</Label>
                  <Input
                    id="barcode"
                    placeholder="BC123456"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="roll_name">Roll Name *</Label>
                  <Input
                    id="roll_name"
                    placeholder="Roll A1"
                    value={formData.roll_name}
                    onChange={(e) => setFormData({ ...formData, roll_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="250"
                    value={formData.width_mm}
                    onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    value={formData.length_m}
                    onChange={(e) => setFormData({ ...formData, length_m: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    placeholder="PT Supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? "Update Roll" : "Add Roll"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <CardTitle className="text-sm font-medium">Active Rolls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rolls.filter((r) => r.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Capacity (m)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rolls.reduce((sum, r) => sum + (r.length_m || 0), 0).toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rolls</CardTitle>
          <CardDescription>Manage packaging rolls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Roll Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Barcode</th>
                  <th className="text-left py-3 px-4 font-semibold">Width</th>
                  <th className="text-left py-3 px-4 font-semibold">Length</th>
                  <th className="text-left py-3 px-4 font-semibold">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolls.map((roll) => (
                  <tr key={roll.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{roll.roll_name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{roll.barcode}</td>
                    <td className="py-3 px-4">{roll.width_mm || "-"} mm</td>
                    <td className="py-3 px-4">{roll.length_m ? roll.length_m.toFixed(2) : "-"} m</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{roll.supplier || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roll.status === "active"
                            ? "bg-green-100 text-green-700"
                            : roll.status === "inactive"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {roll.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Dialog open={openDialog && editingId === roll.id} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(roll)}
                              className="gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Roll</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="barcode">Barcode *</Label>
                                  <Input
                                    id="barcode"
                                    placeholder="BC123456"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="roll_name">Roll Name *</Label>
                                  <Input
                                    id="roll_name"
                                    placeholder="Roll A1"
                                    value={formData.roll_name}
                                    onChange={(e) => setFormData({ ...formData, roll_name: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="width">Width (mm)</Label>
                                  <Input
                                    id="width"
                                    type="number"
                                    placeholder="250"
                                    value={formData.width_mm}
                                    onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="length">Length (m)</Label>
                                  <Input
                                    id="length"
                                    type="number"
                                    step="0.01"
                                    placeholder="1000"
                                    value={formData.length_m}
                                    onChange={(e) => setFormData({ ...formData, length_m: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="weight">Weight (kg)</Label>
                                  <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    placeholder="5"
                                    value={formData.weight_kg}
                                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="supplier">Supplier</Label>
                                  <Input
                                    id="supplier"
                                    placeholder="PT Supplier"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                  >
                                    <SelectTrigger id="status">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                      <SelectItem value="deprecated">Deprecated</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <Button type="submit" className="w-full">
                                Update Roll
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(roll.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
