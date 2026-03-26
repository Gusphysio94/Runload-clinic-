import { useState } from 'react'

const NAV_SECTIONS = [
  {
    label: 'Suivi',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: DashboardIcon },
      { id: 'session', label: 'Nouvelle séance', icon: PlusIcon },
      { id: 'history', label: 'Historique', icon: ListIcon },
      { id: 'trends', label: 'Tendances', icon: TrendIcon },
    ],
  },
  {
    label: 'Programmation',
    items: [
      { id: 'planification', label: 'Plan d\'entraînement', icon: CalendarIcon },
      { id: 'return-to-run', label: 'Reprise course', icon: ReturnRunIcon },
    ],
  },
  {
    label: 'Outils cliniques',
    items: [
      { id: 'vma-calculator', label: 'Calculateur VMA', icon: VMAIcon },
      { id: 'critical-speed', label: 'Vitesse critique', icon: SpeedIcon },
      { id: 'lactate', label: 'Test lactate', icon: LactateIcon },
      { id: 'injury-guide', label: 'Guide blessure', icon: InjuryIcon },
      { id: 'minimalist-index', label: 'Indice minimaliste', icon: ShoeIcon },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { id: 'patient', label: 'Profil patient', icon: UserIcon },
    ],
  },
]

// Flat list for lookups (MobileHeader, etc.)
const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items)

export function Sidebar({ currentPage, onNavigate, patient, store, mobileOpen, onCloseMobile }) {
  const [showPatientMenu, setShowPatientMenu] = useState(false)

  // Fermer le menu mobile + patient menu quand on navigue
  const handleNav = (id) => {
    onNavigate(id)
    setShowPatientMenu(false)
    onCloseMobile?.()
  }

  // Fermer le menu patient quand on navigue (via handleNav)
  // Le cleanup de showPatientMenu est géré dans handleNav et handleSelectPatient

  const handleSelectPatient = (id) => {
    store.setActivePatient(id)
    setShowPatientMenu(false)
  }

  const handleNewPatient = () => {
    store.addPatient({ firstName: '', lastName: '' })
    setShowPatientMenu(false)
    handleNav('patient')
  }

  const handleDeletePatient = (id, e) => {
    e.stopPropagation()
    const p = store.patientsList.find(pa => pa.id === id)
    const name = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'ce patient' : 'ce patient'
    if (confirm(`Supprimer ${name} et toutes ses données ?`)) {
      store.deletePatient(id)
    }
  }

  const sidebarContent = (
    <>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 via-transparent to-primary-900/5 pointer-events-none" />

      {/* Logo */}
      <div className="relative px-6 py-5 md:py-7 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              RunLoad<span className="text-primary-400"> Clinic</span>
            </h1>
            <p className="text-[0.65rem] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
              Gestion de charge
            </p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Patient selector */}
      <div className="relative px-4 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => setShowPatientMenu(!showPatientMenu)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
        >
          {patient ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-600/30 flex items-center justify-center text-sm font-semibold text-primary-300 shrink-0" style={{ fontFamily: 'var(--font-heading)' }}>
                {(patient.firstName?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm text-slate-200 truncate font-medium">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-[0.65rem] text-slate-500 mt-0.5 truncate">
                  {patient.objective || 'Patient actif'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-sm text-slate-500 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm text-slate-400 font-medium">Aucun patient</p>
                <p className="text-[0.65rem] text-slate-600">Créer un patient</p>
              </div>
            </>
          )}
          <ChevronIcon className="w-4 h-4 text-slate-500 shrink-0" expanded={showPatientMenu} />
        </button>

        {/* Dropdown patient list */}
        {showPatientMenu && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-[#1a1f35] border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
            {store.patientsList.length > 0 && (
              <div className="max-h-48 overflow-y-auto py-1">
                {store.patientsList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors ${
                      p.id === store.activePatientId ? 'bg-primary-500/10' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[0.6rem] font-semibold text-slate-300 shrink-0">
                      {(p.firstName?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 truncate font-medium">
                        {p.firstName || ''} {p.lastName || ''}
                        {!p.firstName && !p.lastName && <span className="text-slate-500 italic">Nouveau patient</span>}
                      </p>
                    </div>
                    {p.id === store.activePatientId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                    )}
                    {store.patientsList.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePatient(p.id, e)}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                        title="Supprimer"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-white/[0.06]">
              <button
                onClick={handleNewPatient}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-xs text-primary-400 font-medium">Nouveau patient</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 relative overflow-y-auto">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label} className={sectionIdx > 0 ? 'mt-5' : ''}>
            <p className="px-3.5 pb-1.5 text-[0.6rem] font-semibold text-slate-500 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = currentPage === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary-500/15 text-primary-400 shadow-sm shadow-primary-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-primary-400' : ''}`} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative px-6 py-4 border-t border-white/[0.06] space-y-2">
        <button
          onClick={() => handleNav('legal')}
          className={`flex items-center gap-2 text-[0.65rem] font-medium transition-colors ${
            currentPage === 'legal' ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          À propos &amp; Mentions légales
        </button>
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] text-slate-600 font-medium uppercase tracking-widest">
            RunLoad Clinic v1.1
          </p>
          {store.patientsList.length > 0 && (
            <p className="text-[0.65rem] text-slate-600">
              {store.patientsList.length} patient{store.patientsList.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 bg-surface-dark min-h-screen flex-col shrink-0 sidebar-glow relative overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          {/* Sidebar panel */}
          <aside className="relative w-72 max-w-[85vw] bg-surface-dark flex flex-col sidebar-glow overflow-hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

// ─── Mobile Header ──────────────────────────────────────────────────────────

export function MobileHeader({ onOpenMenu, currentPage, patient }) {
  const currentItem = NAV_ITEMS.find(i => i.id === currentPage)

  return (
    <div className="md:hidden sticky top-0 z-40 bg-surface-dark/95 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
      <button
        onClick={onOpenMenu}
        className="p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'var(--font-heading)' }}>
          {currentItem?.label || 'RunLoad Clinic'}
        </p>
        {patient && (
          <p className="text-[0.6rem] text-slate-400 truncate">
            {patient.firstName} {patient.lastName}
          </p>
        )}
      </div>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChevronIcon({ className, expanded }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ListIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function SpeedIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function LactateIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

function InjuryIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  )
}

function ShoeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18v1.5H3V18zm0-1.5c0-1.5 1.5-3 3-4.5 1-1 2.5-1.5 4-1.5h1c1.5 0 3-.5 4-1.5l3-3c.5-.5 1.2-.8 1.8-.5.8.4 1.2 1.2 1.2 2v3c0 2-1 3.5-2 4.5-.8.8-2 1.5-3.5 1.5H3z" />
    </svg>
  )
}

function VMAIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  )
}

function TrendIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  )
}

function ReturnRunIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  )
}
