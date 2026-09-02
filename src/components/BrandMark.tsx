type BrandMarkProps = {
  subtitle?: string
  className?: string
  label?: string
  labelClassName?: string
  compact?: boolean
}

export const BrandMark = ({
  subtitle = 'Enterprise Suite',
  className = '',
  label = 'RH Manager',
  labelClassName = '',
  compact = false,
}: BrandMarkProps) => {
  const badgeSize = compact ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-10 w-10 sm:h-11 sm:w-11'

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${badgeSize} rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20`}>
        <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-white">RH</span>
      </div>
      <div className="min-w-0">
        <span className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent ${labelClassName}`}>
          {label}
        </span>
        {subtitle ? <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">{subtitle}</p> : null}
      </div>
    </div>
  )
}