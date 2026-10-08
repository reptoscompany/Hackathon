import type { ReactNode } from 'react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

export function Surface({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface rounded-[6px]', className)} {...props}>{children}</div>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('eyebrow', className)}>{children}</div>
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
    <div>
      {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
      <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-warm">{title}</h2>
      {detail && <p className="mt-1 text-[11px] text-muted">{detail}</p>}
    </div>
    {action}
  </div>
}

export function Button({ children, variant = 'secondary', size = 'md', className, ...props }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'border-signal bg-signal text-white hover:bg-softred hover:border-softred',
    secondary: 'border-border bg-card text-warm hover:border-[#62696d] hover:bg-burgundy',
    ghost: 'border-transparent bg-transparent text-muted hover:border-border hover:bg-panel hover:text-warm',
    danger: 'border-signal/70 bg-signal/10 text-softred hover:bg-signal/20',
  }
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-[5px] border font-mono text-[9px] font-medium uppercase tracking-[.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50', size === 'sm' ? 'h-7 px-2.5' : 'h-9 px-3.5', styles[variant], className)} {...props}>{children}</button>
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'high' | 'medium' | 'low' | 'neutral' | 'success'; className?: string }) {
  const styles = { high: 'border-signal/60 bg-signal/10 text-softred', medium: 'border-[#aa8241]/70 bg-[#aa8241]/10 text-[#e8c37f]', low: 'border-[#666d70] bg-[#303437]/60 text-[#d7d9db]', neutral: 'border-border bg-panel text-muted', success: 'border-[#5d7564] bg-[#28332c] text-[#b6d6bd]' }
  return <span className={cn('inline-flex items-center rounded-[3px] border px-1.5 py-1 font-mono text-[8px] font-medium uppercase tracking-[.1em]', styles[tone], className)}>{children}</span>
}

export function KPIBlock({ label, value, trend, detail, icon: Icon, accent = false }: { label: string; value: string; trend: string; detail: string; icon: React.ElementType; accent?: boolean }) {
  return <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={cn('surface group relative overflow-hidden p-4', accent && 'border-l-2 border-l-signal')}>
    <div className="flex items-start justify-between border-b border-border pb-3"><div className="eyebrow">{label}</div><Icon size={14} strokeWidth={1.5} className={cn(accent ? 'text-signal' : 'text-muted')} /></div>
    <div className="mt-4 flex items-end justify-between gap-2"><div className="text-[30px] font-semibold tracking-[-0.06em] text-warm">{value}</div><span className={cn('mono mb-1 text-[9px]', trend.startsWith('+') || trend.startsWith('↑') ? 'text-softred' : 'text-muted')}>{trend}</span></div>
    <div className="mt-1 text-[10px] text-muted">{detail}</div>
  </motion.div>
}

export function LinkAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="group inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.08em] text-muted transition-colors hover:text-warm">{children}<ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" /></button>
}

export function MiniSpark({ values, color = '#E21A2D' }: { values: number[]; color?: string }) {
  const max = Math.max(...values); const min = Math.min(...values)
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - ((value - min) / Math.max(1, max - min)) * 24}`).join(' ')
  return <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-24 overflow-visible"><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="100" cy={28 - ((values[values.length - 1] - min) / Math.max(1, max - min)) * 24} r="1.8" fill={color} /></svg>
}

export function EmptyHint({ title, detail }: { title: string; detail: string }) {
  return <div className="flex min-h-[180px] items-center justify-center rounded-[6px] border border-dashed border-border bg-panel text-center"><div><ArrowUpRight className="mx-auto mb-2 text-muted" size={17} /><div className="text-sm font-medium text-warm">{title}</div><p className="mt-1 text-xs text-muted">{detail}</p></div></div>
}
