import { getStravaAuthUrl, isStravaConnected, getStravaTokens, clearStravaTokens } from '../../utils/strava'

/**
 * Bouton de connexion / déconnexion Strava.
 * Affiché dans la zone d'import du SessionForm.
 */
export function StravaConnect({ onDisconnect }) {
  const connected = isStravaConnected()
  const tokens = getStravaTokens()

  if (connected) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <StravaLogo className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-800 truncate">
              {tokens?.athlete_name || 'Strava connecté'}
            </p>
            <p className="text-[0.65rem] text-orange-600">Compte lié</p>
          </div>
        </div>
        <button
          onClick={() => { clearStravaTokens(); onDisconnect?.() }}
          className="text-xs text-orange-500 hover:text-orange-700 font-medium shrink-0 transition-colors"
        >
          Déconnecter
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => { window.location.href = getStravaAuthUrl() }}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200"
    >
      <StravaLogo className="w-5 h-5" />
      <span className="text-sm font-semibold text-orange-600">Connecter Strava</span>
    </button>
  )
}

function StravaLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FC4C02' }}>
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
    </svg>
  )
}
