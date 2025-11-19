"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Loader2 } from 'lucide-react'

interface UsageData {
  id: string
  roll_id: string
  machine_number: string
  pieces_counter: number
  line_number: number | null
  usage_date: string
  operator_name: string
  packaging_rolls: {
    barcode: string
    roll_name: string
  }
}

export function Analytics() {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const COLORS = ["#3b82f6", "#0ea5e9", "#06b6d4", "#0891b2", "#0284c7", "#1e40af", "#1e3a8a", "#172554"]

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/usage")
      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getDailyTrend = () => {
    const grouped: { [key: string]: number } = {}
    usageData.forEach((record) => {
      const date = new Date(record.usage_date).toLocaleDateString()
      grouped[date] = (grouped[date] || 0) + record.pieces_counter
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, total]) => ({ date, total }))
  }

  const getWeeklyTrend = () => {
    const grouped: { [key: string]: number } = {}
    usageData.forEach((record) => {
      const date = new Date(record.usage_date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toLocaleDateString()
      grouped[weekKey] = (grouped[weekKey] || 0) + record.pieces_counter
    })
    
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, total]) => ({ week, total }))
  }

  const getHourlyPattern = () => {
    const grouped: { [key: number]: number } = {}
    usageData.forEach((record) => {
      const hour = new Date(record.usage_date).getHours()
      grouped[hour] = (grouped[hour] || 0) + record.pieces_counter
    })
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      usage: grouped[i] || 0,
    }))
  }

  const getMachineUsage = () => {
    const grouped: { [key: string]: number } = {}
    usageData.forEach((record) => {
      grouped[record.machine_number] = (grouped[record.machine_number] || 0) + record.pieces_counter
    })
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([machine, total]) => ({ machine: `Machine ${machine}`, total }))
  }

  const getLineUsage = () => {
    const grouped: { [key: number]: number } = {}
    usageData.forEach((record) => {
      if (record.line_number) {
        grouped[record.line_number] = (grouped[record.line_number] || 0) + record.pieces_counter
      }
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
      .map(([line, total]) => ({ line: `Line ${line}`, total }))
  }

  const getRollUsage = () => {
    const grouped: { [key: string]: number } = {}
    usageData.forEach((record) => {
      const name = record.packaging_rolls.roll_name
      grouped[name] = (grouped[name] || 0) + record.pieces_counter
    })
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, total]) => ({ name, value: total }))
  }

  const getOperatorPerformance = () => {
    const grouped: { [key: string]: { count: number; total: number } } = {}
    usageData.forEach((record) => {
      const name = record.operator_name || "Unknown"
      if (!grouped[name]) grouped[name] = { count: 0, total: 0 }
      grouped[name].count += 1
      grouped[name].total += record.pieces_counter
    })
    
    return Object.entries(grouped)
      .map(([operator, data]) => ({
        operator: operator.length > 12 ? operator.substring(0, 12) + "..." : operator,
        transactions: data.count,
        avgPieces: Math.round(data.total / data.count),
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }

  const getMachineEfficiency = () => {
    const machineStats: { [key: string]: { total: number; count: number } } = {}
    usageData.forEach((record) => {
      if (!machineStats[record.machine_number]) {
        machineStats[record.machine_number] = { total: 0, count: 0 }
      }
      machineStats[record.machine_number].total += record.pieces_counter
      machineStats[record.machine_number].count += 1
    })
    
    return Object.entries(machineStats)
      .map(([machine, stats]) => ({
        machine: `M-${machine}`,
        avgPerTransaction: Math.round(stats.total / stats.count),
        transactions: stats.count,
      }))
      .sort((a, b) => b.transactions - a.transactions)
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      const headers = ["Roll Name", "Barcode", "Machine Number", "Pieces Counter", "Line", "Operator", "Date"]
      const rows = usageData.map((record) => [
        record.packaging_rolls.roll_name,
        record.packaging_rolls.barcode,
        record.machine_number,
        record.pieces_counter,
        record.line_number || "",
        record.operator_name || "",
        new Date(record.usage_date).toLocaleString(),
      ])

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `roll-usage-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({ title: "Success", description: "Data exported to CSV" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  const dailyTrend = getDailyTrend()
  const weeklyTrend = getWeeklyTrend()
  const hourlyPattern = getHourlyPattern()
  const machineUsage = getMachineUsage()
  const lineUsage = getLineUsage()
  const rollUsage = getRollUsage()
  const operatorPerformance = getOperatorPerformance()
  const machineEfficiency = getMachineEfficiency()

  const totalPieces = usageData.reduce((sum, r) => sum + r.pieces_counter, 0)
  const avgPerTransaction = usageData.length > 0 ? Math.round(totalPieces / usageData.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={exportToCSV} disabled={exporting} className="gap-2">
          {exporting && <Loader2 className="w-4 h-4 animate-spin" />}
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pieces Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPieces}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgPerTransaction}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{new Set(usageData.map((r) => r.machine_number)).size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Trend</CardTitle>
          <CardDescription>Total pieces used per day</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorDaily)" name="Pieces" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
            <CardDescription>Pieces used by week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0ea5e9" name="Pieces" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Usage Pattern</CardTitle>
            <CardDescription>Peak usage times throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyPattern.some((h) => h.usage > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="usage" stroke="#06b6d4" name="Pieces" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Machine</CardTitle>
            <CardDescription>Total pieces used per machine</CardDescription>
          </CardHeader>
          <CardContent>
            {machineUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={machineUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="machine" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" name="Pieces" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Used Rolls</CardTitle>
            <CardDescription>Most used packaging rolls</CardDescription>
          </CardHeader>
          <CardContent>
            {rollUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rollUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}pcs`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rollUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operator Performance</CardTitle>
            <CardDescription>Top operators by pieces volume</CardDescription>
          </CardHeader>
          <CardContent>
            {operatorPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operatorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="operator" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#0891b2" name="Transactions" />
                  <Bar dataKey="total" fill="#0ea5e9" name="Total Pieces" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Efficiency</CardTitle>
            <CardDescription>Average pieces per transaction by machine</CardDescription>
          </CardHeader>
          <CardContent>
            {machineEfficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="transactions" name="Transactions" />
                  <YAxis dataKey="avgPerTransaction" name="Avg Pieces" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={machineEfficiency} fill="#0284c7" name="Machines">
                    {machineEfficiency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
