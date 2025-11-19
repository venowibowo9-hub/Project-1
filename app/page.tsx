"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dashboard } from "@/components/dashboard"
import { RollManagement } from "@/components/roll-management"
import { Analytics } from "@/components/analytics"
import { Package, BarChart3, Settings, LogOut } from 'lucide-react'
import Image from "next/image"

export default function Home() {

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-white rounded-full p-1 shadow-sm overflow-hidden">
                <Image
                  src="/images/kapal-api-logo.jpg"
                  alt="Kapal Api Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Packaging Roll Tracker</h1>
                <p className="text-sm text-muted-foreground">Production Line Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Manage</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Analytics />
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <RollManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
