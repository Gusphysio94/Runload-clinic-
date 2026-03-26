import { useState, useEffect } from 'react'

const TYPES = {
  success: {
    bg: 'bg-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-slate-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
}

export function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const config = TYPES[type] || TYPES.success

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onDismiss, 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] transition-all duration-300 ease-out pointer-events-none
        ${visible && !exiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      style={{ transform: `translateX(-50%) translateY(${visible && !exiting ? '0' : '1rem'})` }}
    >
      <div className={`${config.bg} text-white px-4 py-2.5 rounded-xl shadow-lg shadow-black/20
        flex items-center gap-2.5 text-sm font-medium pointer-events-auto`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {config.icon}
        {message}
      </div>
    </div>
  )
}
