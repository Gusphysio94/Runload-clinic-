export function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          {label}
          {required && <span className="text-primary-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-text-muted leading-relaxed">{hint}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-text-primary
        placeholder:text-text-muted/70
        focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
        hover:border-slate-300
        transition-all duration-200 text-sm ${className}`}
      {...props}
    />
  )
}

export function Select({ options, placeholder, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-text-primary
        focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
        hover:border-slate-300
        transition-all duration-200 text-sm ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function Slider({ value, onChange, min = 1, max = 10, labels, className = '' }) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-primary-500) ${percentage}%, var(--color-border) ${percentage}%)`
        }}
      />
      <div className="flex justify-between items-center text-xs text-text-muted">
        <span>{labels?.[0] || min}</span>
        <span className="font-bold text-primary-600 text-base tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
          {value}
        </span>
        <span>{labels?.[1] || max}</span>
      </div>
    </div>
  )
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-text-primary group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-400 focus:ring-offset-0"
      />
      <span className="group-hover:text-text-primary transition-colors">{label}</span>
    </label>
  )
}

export function TextArea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-text-primary
        placeholder:text-text-muted/70
        focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
        hover:border-slate-300
        transition-all duration-200 text-sm resize-y min-h-[80px] ${className}`}
      {...props}
    />
  )
}
