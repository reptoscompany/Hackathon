import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="min-h-screen bg-ink text-warm"><div className="flex min-h-screen"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="min-w-0 flex-1"><Topbar onMenu={() => setSidebarOpen(true)} /><main className="mx-auto max-w-[1760px] px-5 py-6 lg:px-7 lg:py-7">{children}</main></div></div></div>
}
