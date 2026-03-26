export function Card({ children, className = '', title, subtitle }) {
  return (
    <div className={`bg-surface-card rounded-2xl border border-border/60 shadow-sm shadow-black/[0.03]
      hover:shadow-md hover:shadow-black/[0.05] transition-all duration-300 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-border/60">
          {title && (
            <h3 className="text-[0.95rem] font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
