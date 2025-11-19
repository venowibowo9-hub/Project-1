"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

interface Roll {
  id: string
  barcode: string
  roll_name: string
}

interface BarcodeScannerFormProps {
  rolls: Roll[]
  onSuccess: () => void
}

export function BarcodeScannerForm({ rolls, onSuccess }: BarcodeScannerFormProps) {
  const [barcode, setBarcode] = useState("")
  const [machineNumber, setMachineNumber] = useState("")
  const [piecesCounter, setPiecesCounter] = useState("")
  const [lineNumber, setLineNumber] = useState("")
  const [operatorName, setOperatorName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcode || !machineNumber || !piecesCounter) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Barcode, Machine Number, Pieces Counter)",
        variant: "destructive",
      })
      return
    }

    const selectedRoll = rolls.find((r) => r.barcode === barcode)
    if (!selectedRoll) {
      toast({
        title: "Error",
        description: "Barcode not found",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_id: selectedRoll.id,
          machine_number: machineNumber,
          pieces_counter: Number.parseInt(piecesCounter),
          line_number: lineNumber ? Number.parseInt(lineNumber) : null,
          operator_name: operatorName,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Recorded ${piecesCounter} pcs for machine ${machineNumber}`,
        })
        setBarcode("")
        setMachineNumber("")
        setPiecesCounter("")
        setLineNumber("")
        setOperatorName("")
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record usage",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleBarcodeSubmit} className="space-y-4">
      <div>
        <Label htmlFor="barcode">Barcode *</Label>
        <Input
          id="barcode"
          placeholder="Scan barcode here..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          autoFocus
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine">Machine Number *</Label>
          <Input
            id="machine"
            placeholder="M-001"
            value={machineNumber}
            onChange={(e) => setMachineNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pieces">Pieces Counter *</Label>
          <Input
            id="pieces"
            type="number"
            placeholder="100"
            value={piecesCounter}
            onChange={(e) => setPiecesCounter(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="line">Line Number (Optional)</Label>
        <Input
          id="line"
          type="number"
          placeholder="1"
          value={lineNumber}
          onChange={(e) => setLineNumber(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="operator">Operator Name</Label>
        <Input
          id="operator"
          placeholder="Your name"
          value={operatorName}
          onChange={(e) => setOperatorName(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Record Usage
      </Button>
    </form>
  )
}
