import { useState } from 'react'
import { useStore } from './store/useStore'
import { Sidebar, MobileHeader } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { PatientProfile } from './components/patient/PatientProfile'
import { SessionForm } from './components/session/SessionForm'
import { SessionList } from './components/session/SessionList'
import { CriticalSpeedCalculator } from './components/tools/CriticalSpeedCalculator'
import { LactateTestCalculator } from './components/tools/LactateTestCalculator'
import { InjuryGuidance } from './components/tools/InjuryGuidance'
import { TrainingPlan } from './components/planification/TrainingPlan'
import { MinimalistIndex } from './components/tools/MinimalistIndex'
import { LegalPage } from './components/legal/LegalPage'
import { ReturnToRun } from './components/tools/ReturnToRun'

function App() {
  const store = useStore()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [editingSession, setEditingSession] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSavePatient = (patient) => {
    store.setPatient(patient)
    setCurrentPage('dashboard')
  }

  const handleSaveSession = (session) => {
    if (editingSession) {
      store.updateSession(editingSession.id, session)
      setEditingSession(null)
    } else {
      store.addSession(session)
    }
    setCurrentPage('history')
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setCurrentPage('session')
  }

  const handleDeleteSession = (id) => {
    store.deleteSession(id)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            patient={store.patient}
            sessions={store.sessions}
            trainingPlan={store.trainingPlan}
          />
        )
      case 'patient':
        return (
          <PatientProfile
            patient={store.patient}
            onSave={handleSavePatient}
          />
        )
      case 'session':
        return (
          <SessionForm
            patient={store.patient}
            onSave={handleSaveSession}
            initialData={editingSession}
            onCancel={editingSession ? () => { setEditingSession(null); setCurrentPage('history') } : null}
          />
        )
      case 'history':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Historique des séances</h2>
                <p className="text-text-secondary text-sm mt-1">
                  {store.sessions.length} séance(s) enregistrée(s)
                </p>
              </div>
              <button
                onClick={() => { setEditingSession(null); setCurrentPage('session') }}
                className="inline-flex items-center gap-2 px-3 md:px-5 py-2.5 bg-gradient-to-b from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl
                  hover:from-primary-500 hover:to-primary-700 shadow-sm shadow-primary-600/25 hover:shadow-md hover:shadow-primary-600/30
                  transition-all duration-200 shrink-0"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <span className="hidden sm:inline">+</span> Nouvelle séance
              </button>
            </div>
            <SessionList
              sessions={store.sessions}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
            />
          </div>
        )
      case 'planification':
        return (
          <TrainingPlan
            patient={store.patient}
            store={store}
          />
        )
      case 'critical-speed':
        return (
          <CriticalSpeedCalculator
            patient={store.patient}
            onApplyToProfile={(csKmh) => {
              if (store.patient) {
                store.updatePatient({
                  criticalSpeed: Number(csKmh.toFixed(2)),
                  intensityReference: 'vc',
                })
              }
            }}
          />
        )
      case 'lactate':
        return (
          <LactateTestCalculator patient={store.patient} />
        )
      case 'injury-guide':
        return (
          <InjuryGuidance patient={store.patient} />
        )
      case 'minimalist-index':
        return (
          <MinimalistIndex />
        )
      case 'return-to-run':
        return (
          <ReturnToRun patient={store.patient} />
        )
      case 'legal':
        return (
          <LegalPage />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        patient={store.patient}
        store={store}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 overflow-y-auto bg-grain min-w-0">
        <MobileHeader
          onOpenMenu={() => setMobileMenuOpen(true)}
          currentPage={currentPage}
          patient={store.patient}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
