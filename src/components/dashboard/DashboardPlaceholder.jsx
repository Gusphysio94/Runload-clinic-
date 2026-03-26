import { Card } from '../ui/Card'

export function DashboardPlaceholder({ patient, sessions }) {
  const totalSessions = sessions.length
  const totalKm = sessions.reduce((sum, s) => sum + (s.distance || 0), 0)
  const totalElevation = sessions.reduce((sum, s) => sum + (s.elevationGain || 0), 0)
  const avgRPE = totalSessions > 0
    ? (sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / totalSessions).toFixed(1)
    : '—'

  // Dernières 7 jours de séances
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeek = sessions.filter(s => new Date(s.date) >= weekAgo)
  const weekKm = thisWeek.reduce((sum, s) => sum + (s.distance || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Tableau de bord</h2>
        <p className="text-text-secondary text-sm mt-1">
          {patient ? `${patient.firstName} ${patient.lastName}` : 'Aucun patient — créez un profil pour commencer'}
        </p>
      </div>

      {!patient ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👟</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Bienvenue sur RunLoad Clinic</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Commencez par créer le profil de votre patient pour débuter le suivi
              de sa charge d'entraînement.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Séances totales" value={totalSessions} />
            <StatCard label="Volume total" value={`${totalKm.toFixed(1)} km`} />
            <StatCard label="Volume semaine" value={`${weekKm.toFixed(1)} km`} />
            <StatCard label="RPE moyen" value={avgRPE} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="D+ total" value={`${totalElevation} m`} />
            <StatCard label="Séances cette semaine" value={thisWeek.length} />
          </div>

          {/* Placeholder dashboard */}
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Dashboard complet — Phase 2
              </h3>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                Le moteur de calcul (ACWR, monotonie, score de risque, graphiques d'évolution)
                sera implémenté dans la prochaine phase. Continuez à saisir des séances
                pour alimenter les données.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface-card rounded-xl border border-border p-4 shadow-sm">
      <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    </div>
  )
}
