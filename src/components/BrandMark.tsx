import { Crosshair, ShieldCheck } from 'lucide-react'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#6aa397] bg-[#24463e] text-[#e0a35c] shadow-none">
      <ShieldCheck size={19} strokeWidth={1.45} />
      <Crosshair size={9} className="absolute" strokeWidth={2.4} />
    </div>
    {!compact && <div>
      <div className="text-[12px] font-extrabold tracking-[.12em] text-[#fffdf8]">CRIMEMAP <span className="text-[#e0a35c]">AI</span></div>
      <div className="mono mt-0.5 text-[8px] uppercase tracking-[.16em] text-[#9fb7ad]">Puducherry Police</div>
    </div>}
  </div>
}
