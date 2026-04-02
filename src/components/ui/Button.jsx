const variants = {
  primary: `bg-gradient-to-b from-primary-500 to-primary-600 text-white
    hover:from-primary-500 hover:to-primary-700
    shadow-sm shadow-primary-600/25 hover:shadow-md hover:shadow-primary-600/30
    active:from-primary-600 active:to-primary-700`,
  secondary: `bg-white text-text-primary border border-border/80
    hover:bg-surface hover:border-border
    shadow-sm shadow-black/[0.03]`,
  danger: `bg-gradient-to-b from-risk-red to-red-600 text-white
    hover:from-red-500 hover:to-red-700
    shadow-sm shadow-risk-red/25`,
  ghost: `text-text-secondary hover:text-text-primary hover:bg-slate-100`,
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-heading)' }}
      {...props}
    >
      {children}
    </button>
  )
}
