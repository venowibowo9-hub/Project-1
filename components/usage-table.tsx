"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Trash2, Loader2 } from 'lucide-react'

interface UsageRecord {
  id: string
  roll_id: string
  machine_number: string
  pieces_counter: number
  line_number: number | null
  usage_date: string
  operator_name: string
  notes: string
  packaging_rolls: {
    id: string
    barcode: string
    roll_name: string
    width_mm: number
    length_m: number
  }
}

interface UsageTableProps {
  data: UsageRecord[]
  onRefresh: () => void
}

export function UsageTable({ data, onRefresh }: UsageTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<UsageRecord>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleEdit = (record: UsageRecord) => {
    setEditingId(record.id)
    setEditData({ ...record })
  }

  const handleSaveEdit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/usage/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_number: editData.machine_number,
          pieces_counter: editData.pieces_counter,
          line_number: editData.line_number,
          operator_name: editData.operator_name,
          notes: editData.notes,
        }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Usage updated successfully" })
        setEditingId(null)
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update usage", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return

    try {
      const response = await fetch(`/api/usage/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Success", description: "Usage deleted successfully" })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete usage", variant: "destructive" })
    }
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No usage records yet</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Roll Name</th>
            <th className="text-left py-3 px-4 font-semibold">Barcode</th>
            <th className="text-left py-3 px-4 font-semibold">Machine</th>
            <th className="text-left py-3 px-4 font-semibold">Pieces</th>
            <th className="text-left py-3 px-4 font-semibold">Line</th>
            <th className="text-left py-3 px-4 font-semibold">Operator</th>
            <th className="text-left py-3 px-4 font-semibold">Date</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4">{record.packaging_rolls.roll_name}</td>
              <td className="py-3 px-4 font-mono text-xs">{record.packaging_rolls.barcode}</td>
              <td className="py-3 px-4 font-semibold text-blue-600">{record.machine_number}</td>
              <td className="py-3 px-4 font-semibold">{record.pieces_counter}</td>
              <td className="py-3 px-4">{record.line_number || "-"}</td>
              <td className="py-3 px-4 text-muted-foreground">{record.operator_name || "-"}</td>
              <td className="py-3 px-4 text-muted-foreground text-xs">
                {new Date(record.usage_date).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(record)} className="gap-1">
                        <Edit2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Usage Record</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Roll</Label>
                          <div className="p-2 bg-muted rounded text-sm">{record.packaging_rolls.roll_name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-machine">Machine Number</Label>
                            <Input
                              id="edit-machine"
                              value={editData.machine_number}
                              onChange={(e) =>
                                setEditData({ ...editData, machine_number: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-pieces">Pieces Counter</Label>
                            <Input
                              id="edit-pieces"
                              type="number"
                              value={editData.pieces_counter}
                              onChange={(e) =>
                                setEditData({ ...editData, pieces_counter: Number.parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit-line">Line Number</Label>
                          <Input
                            id="edit-line"
                            type="number"
                            value={editData.line_number || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, line_number: e.target.value ? Number.parseInt(e.target.value) : null })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-operator">Operator Name</Label>
                          <Input
                            id="edit-operator"
                            value={editData.operator_name}
                            onChange={(e) => setEditData({ ...editData, operator_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-notes">Notes</Label>
                          <Input
                            id="edit-notes"
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleSaveEdit} className="w-full" disabled={loading}>
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(record.id)}
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
  )
}
