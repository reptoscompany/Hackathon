import { NavLink } from 'react-router-dom'
import { Activity, BarChart3, Bot, FileText, Gauge, Map, PanelLeftClose, Route, Settings, ShieldAlert, Siren, X } from 'lucide-react'
import { cn } from '../lib/utils'

type NavItem = { label: string; to: string; icon: React.ElementType }

const groups: Array<{ label: string; items: NavItem[] }> = [
  { label: 'Command', items: [{ label: 'Dashboard', to: '/dashboard', icon: Gauge }, { label: 'Crime Map', to: '/crime-map', icon: Map }, { label: 'Incidents', to: '/incidents', icon: Siren }] },
  { label: 'Intelligence', items: [{ label: 'AI Assistant', to: '/ai-assistant', icon: Bot }, { label: 'Analytics', to: '/analytics', icon: BarChart3 }, { label: 'Prediction', to: '/prediction', icon: ShieldAlert }] },
  { label: 'Field operations', items: [{ label: 'Patrol Planning', to: '/patrol-planning', icon: Route }, { label: 'Reports', to: '/reports', icon: FileText }] },
]

function RailItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const Icon = item.icon
  return <NavLink to={item.to} onClick={onClose} className={({ isActive }) => cn('group relative flex h-9 items-center gap-3 border-l-2 px-3 text-[11px] transition-colors', isActive ? 'border-[#e0a35c] bg-[#24463e] text-[#fffdf8]' : 'border-transparent text-[#b7c9c2] hover:border-[#6aa397] hover:bg-[#204139] hover:text-[#fffdf8]')}>
    {({ isActive }) => <><Icon size={14} strokeWidth={1.6} className={cn(isActive ? 'text-[#e0a35c]' : 'text-[#8eaba1] group-hover:text-[#d7e8df]')} /><span>{item.label}</span>{isActive && <span className="mono ml-auto text-[8px] text-[#e0a35c]">ACTIVE</span>}</>}
  </NavLink>
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <>
    <div onClick={onClose} className={cn('fixed inset-0 z-30 bg-[#102822]/55 transition-opacity lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} />
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-[#2f5a50] bg-[#18352f] px-3 py-4 transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="mb-5 border-y border-[#2f5a50] px-2 py-2"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#9fb7ad]">Station network</span><span className="mono text-[8px] text-[#9fb7ad]">PDC / 01</span></div><div className="mt-1 text-[10px] text-[#fffdf8]">White Town Police Station</div></div>
      <nav className="space-y-5">{groups.map((group) => <div key={group.label}><div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#9fb7ad]">{group.label}</div><div className="space-y-0.5">{group.items.map((item) => <RailItem key={item.to} item={item} onClose={onClose} />)}</div></div>)}<div><div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#9fb7ad]">System</div><RailItem item={{ label: 'Settings', to: '/settings', icon: Settings }} onClose={onClose} /></div></nav>
      <div className="mt-auto space-y-4"><div className="border-t border-[#2f5a50] pt-4"><div className="flex items-center gap-2 px-2"><span className="h-1.5 w-1.5 rounded-full bg-[#80c6a1]" /><span className="mono text-[8px] tracking-[.12em] text-[#bfe0c9]">SYSTEM OPERATIONAL</span></div><div className="mt-2 flex items-center justify-between px-2 text-[9px] text-[#9fb7ad]"><span>Last sync</span><span className="mono text-[#fffdf8]">19:42:16</span></div></div><div className="border border-[#2f5a50] bg-[#204139] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#fffdf8]"><Activity size={12} className="text-[#e0a35c]" />CRIMEMAP AI</div><div className="mono mt-1 text-[8px] text-[#9fb7ad]">v1.0 / FRONTEND PROTOTYPE</div></div><button className="flex items-center gap-2 px-2 text-[9px] text-[#9fb7ad] transition-colors hover:text-[#fffdf8]"><PanelLeftClose size={12} />Collapse rail</button></div>
    </aside>
  </>
}
