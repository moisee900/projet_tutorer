import { HeartHandshake, Sparkles } from 'lucide-react'

type RHProLogoProps = {
  compact?: boolean
  className?: string
}

export const RHProLogo = ({ compact = false, className = '' }: RHProLogoProps) => (
  <div className={`flex items-center gap-3 ${className}`} aria-label="RH Manager">
    <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-300/40 bg-gradient-to-br from-cyan-500 via-sky-500 to-primary-700 shadow-lg shadow-cyan-950/30">
      <HeartHandshake className="h-6 w-6 text-white" strokeWidth={2.3} />
      <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-200" fill="currentColor" />
    </div>
    {!compact && (
      <div className="min-w-0 leading-tight">
        <p className="text-xl font-extrabold tracking-normal text-cyan-400">RH Manager</p>
      </div>
    )}
  </div>
)
