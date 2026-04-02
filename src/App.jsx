import { useState, useCallback, Component } from 'react'
import { useStore } from './store/useStore'
import { useAuth } from './store/useAuth'
import { parseStravaCallbackHash } from './utils/strava'
import { Sidebar, MobileHeader } from './components/layout/Sidebar'
import { Toast } from './components/ui/Toast'
import { Dashboard } from './components/dashboard/Dashboard'
import { PatientProfile } from './components/patient/PatientProfile'
import { SessionForm } from './components/session/SessionForm'
import { SessionList } from './components/session/SessionList'
import { CriticalSpeedCalculator } from './components/tools/CriticalSpeedCalculator'
import { LactateTestCalculator } from './components/tools/LactateTestCalculator'
import { InjuryGuidance } from './components/tools/InjuryGuidance'
import { TrainingPlan } from './components/planification/TrainingPlan'
import { ChaussageDashboard } from './components/chaussage/ChaussageDashboard'
import { LegalPage } from './components/legal/LegalPage'
import { ReturnToRun } from './components/tools/ReturnToRun'
import { TrendsDashboard } from './components/trends/TrendsDashboard'
import { VMACalculator } from './components/tools/VMACalculator'
import { RacePredictor } from './components/tools/RacePredictor'
import { PaceConverter } from './components/tools/PaceConverter'
import { PatientHub } from './components/patient/PatientHub'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { AccountSettings } from './components/auth/AccountSettings'

function App() {
  const auth = useAuth()
  const [authPage, setAuthPage] = useState('login')

  // Loading — checking session
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grain">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!auth.user) {
    return authPage === 'register'
      ? <RegisterPage auth={auth} onSwitch={() => { setAuthPage('login'); auth.setError(null) }} />
      : <LoginPage auth={auth} onSwitch={() => { setAuthPage('register'); auth.setError(null) }} />
  }

  return <AuthenticatedApp user={auth.user} auth={auth} onSignOut={auth.signOut} />
}

function AuthenticatedApp({ user, auth, onSignOut }) {
  const store = useStore(user)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [editingSession, setEditingSession] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState(() => {
    // Handle Strava OAuth callback on initial render
    const result = parseStravaCallbackHash()
    if (!result) return null
    if (!result.error) {
      return { message: 'Strava connecté avec succès', type: 'success', key: Date.now() }
    }
    const reasons = {
      no_code: 'Autorisation Strava annulée',
      scope_denied: 'Permissions Strava insuffisantes',
      token_exchange: 'Erreur de connexion Strava',
      server_error: 'Erreur serveur Strava',
    }
    return { message: reasons[result.reason] || 'Erreur Strava', type: 'error', key: Date.now() }
  })

  const handlePatientSwitch = useCallback(() => {
    setEditingSession(null)
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const handleSavePatient = (patient) => {
    const isNew = !store.patient
    store.setPatient(patient)
    showToast(isNew ? 'Profil patient créé' : 'Profil patient mis à jour')
    setCurrentPage('dashboard')
  }

  const handleSaveSession = (session) => {
    if (editingSession) {
      store.updateSession(editingSession.id, session)
      setEditingSession(null)
      showToast('Séance modifiée')
    } else {
      store.addSession(session)
      showToast('Séance enregistrée')
    }
    setCurrentPage('dashboard')
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setCurrentPage('session')
  }

  const handleDeleteSession = (id) => {
    store.deleteSession(id)
    showToast('Séance supprimée', 'info')
  }

  const handleRepeatSession = (session) => {
    const today = new Date().toISOString().slice(0, 10)
    const { id: _id, ...rest } = session
    // Use a unique key to force SessionForm remount with new data
    setEditingSession({ ...rest, id: undefined, date: today, _repeatKey: Date.now() })
    setCurrentPage('session')
    showToast('Séance dupliquée — modifiez et enregistrez', 'info')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'patients':
        return (
          <PatientHub
            patients={store.patientSummaries}
            activePatientId={store.activePatientId}
            onSelect={(id) => { store.setActivePatient(id); setCurrentPage('dashboard') }}
            onCreate={(firstName, lastName) => { store.addPatient({ firstName, lastName }); setCurrentPage('dashboard') }}
            onDelete={(id) => store.deletePatient(id)}
            onEdit={(id) => { store.setActivePatient(id); setCurrentPage('patient') }}
          />
        )
      case 'dashboard':
        if (!store.patient && !store.patientsList.length) {
          return (
            <PatientHub
              patients={store.patientSummaries}
              activePatientId={store.activePatientId}
              onSelect={(id) => { store.setActivePatient(id); setCurrentPage('dashboard') }}
              onCreate={(firstName, lastName) => { store.addPatient({ firstName, lastName }); setCurrentPage('dashboard') }}
              onDelete={(id) => store.deletePatient(id)}
              onEdit={(id) => { store.setActivePatient(id); setCurrentPage('patient') }}
            />
          )
        }
        return (
          <Dashboard
            patient={store.patient}
            sessions={store.sessions}
            trainingPlan={store.trainingPlan}
            clinicalNotes={store.clinicalNotes}
            onNavigate={setCurrentPage}
          />
        )
      case 'patient':
        return (
          <PatientProfile
            patient={store.patient}
            onSave={handleSavePatient}
            clinicalNotes={store.clinicalNotes}
            onAddNote={store.addClinicalNote}
            onUpdateNote={store.updateClinicalNote}
            onDeleteNote={store.deleteClinicalNote}
          />
        )
      case 'session':
        return (
          <SessionForm
            key={editingSession?.id || editingSession?._repeatKey || 'new'}
            patient={store.patient}
            sessions={store.sessions}
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
              onRepeat={handleRepeatSession}
            />
          </div>
        )
      case 'trends':
        return (
          <TrendsDashboard
            patient={store.patient}
            sessions={store.sessions}
          />
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
            onApplyToProfile={(csKmh, extras) => {
              if (store.patient) {
                const updates = {
                  criticalSpeed: Number(csKmh.toFixed(2)),
                  intensityReference: 'vc',
                }
                if (extras?.riegelK) updates.riegelK = extras.riegelK
                if (extras?.dPrime) updates.dPrime = extras.dPrime
                store.updatePatient(updates)
              }
            }}
          />
        )
      case 'lactate':
        return (
          <LactateTestCalculator
            patient={store.patient}
            onApplyToProfile={(data) => {
              if (store.patient && data) {
                store.updatePatient(data)
              }
            }}
          />
        )
      case 'injury-guide':
        return (
          <InjuryGuidance patient={store.patient} />
        )
      case 'vma-calculator':
        return (
          <VMACalculator
            patient={store.patient}
            onApplyToProfile={(vma) => {
              if (store.patient) {
                store.updatePatient({
                  vma: Number(vma.toFixed(1)),
                  intensityReference: 'vma',
                })
              }
            }}
          />
        )
      case 'pace-converter':
        return (
          <PaceConverter patient={store.patient} />
        )
      case 'race-predictor':
        return (
          <RacePredictor patient={store.patient} />
        )
      case 'chaussage':
        return (
          <ChaussageDashboard patient={store.patient} store={store} />
        )
      case 'return-to-run':
        return (
          <ReturnToRun patient={store.patient} />
        )
      case 'legal':
        return (
          <LegalPage />
        )
      case 'account':
        return (
          <AccountSettings
            user={user}
            auth={auth}
            onBack={() => setCurrentPage('dashboard')}
          />
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
        onPatientSwitch={handlePatientSwitch}
        user={user}
        onSignOut={onSignOut}
      />
      <main className="flex-1 overflow-y-auto bg-grain min-w-0">
        <MobileHeader
          onOpenMenu={() => setMobileMenuOpen(true)}
          currentPage={currentPage}
          patient={store.patient}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </div>
      </main>

      {/* FAB mobile — Ajouter séance */}
      {store.patient && currentPage !== 'session' && (
        <button
          onClick={() => { setEditingSession(null); setCurrentPage('session') }}
          className="md:hidden fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full
            bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/30
            hover:shadow-xl hover:shadow-primary-600/40 active:scale-95 transition-all duration-200
            flex items-center justify-center"
          aria-label="Nouvelle séance"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl m-4">
          <h2 className="text-lg font-bold text-red-700 mb-2">Erreur de rendu</h2>
          <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
          <pre className="text-xs text-red-400 mt-2 whitespace-pre-wrap break-words">{this.state.error.stack}</pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default App
