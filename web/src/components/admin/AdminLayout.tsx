import React from 'react'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-ivory">
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden transition-opacity',
        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className="absolute inset-0 bg-charcoal/50" onClick={() => setSidebarOpen(false)} />
        <aside className="relative w-64 h-full bg-charcoal text-ivory">
          <AdminSidebar />
        </aside>
      </div>

      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}