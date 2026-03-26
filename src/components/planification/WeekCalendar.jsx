import { useState } from 'react'
import { PlanSessionCard } from './PlanSessionCard'
import { SessionDetailModal } from './SessionDetailModal'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function WeekCalendar({ plan, store }) {
  const [selectedSession, setSelectedSession] = useState(null)

  if (!plan || !plan.weeks) return null

  const completedSessions = plan.completedSessions || {}

  return (
    <>
      <div className="space-y-4">
        {plan.weeks.map((week) => {
          const weekCompleted = week.sessions.filter(s => completedSessions[s.id]?.done).length
          const weekTotal = week.sessions.length

          return (
            <div key={week.weekNumber}>
              {/* Week header */}
              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {week.label}
                </h3>
                <span className="text-xs text-text-muted">
                  {week.totalVolume.toFixed(0)} km · {week.totalDuration} min · {week.sessions.length} séances
                </span>
                {weekCompleted > 0 && (
                  <span className="text-[0.65rem] font-medium text-green-600 bg-green-50 border border-green-200/50 rounded-full px-2 py-0.5">
                    {weekCompleted}/{weekTotal}
                  </span>
                )}
                {week.isDeload && (
                  <span className="text-[0.65rem] font-semibold text-primary-400 bg-primary-400/10 border border-primary-400/20 rounded-full px-2 py-0.5">
                    Décharge
                  </span>
                )}
              </div>

              {/* Desktop: 7-column calendar grid */}
              <div className="hidden md:grid grid-cols-7 gap-1.5">
                {/* Day headers */}
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider pb-1">
                    {day}
                  </div>
                ))}

                {/* Day cells */}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const session = week.sessions.find(s => s.dayOfWeek === dayIndex)
                  const isCompleted = session ? !!completedSessions[session.id]?.done : false

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[6rem] rounded-lg ${
                        session
                          ? ''
                          : 'bg-surface-dark/30 border border-border/30 flex items-center justify-center'
                      }`}
                    >
                      {session ? (
                        <PlanSessionCard
                          session={session}
                          onClick={setSelectedSession}
                          isCompleted={isCompleted}
                        />
                      ) : (
                        <span className="text-[0.6rem] text-text-muted/50">Repos</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Mobile: list of sessions only (no empty rest days) */}
              <div className="md:hidden space-y-2">
                {week.sessions.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">Aucune séance cette semaine</p>
                ) : (
                  week.sessions.map(session => {
                    const isCompleted = !!completedSessions[session.id]?.done
                    return (
                      <div key={session.id} className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-semibold text-text-muted w-8 shrink-0 text-center">
                          {DAYS[session.dayOfWeek]}
                        </span>
                        <div className="flex-1">
                          <PlanSessionCard
                            session={session}
                            onClick={setSelectedSession}
                            isCompleted={isCompleted}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal détail */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          zonePaces={plan.zonePaces}
          completionData={completedSessions[selectedSession.id]}
          linkedSession={
            completedSessions[selectedSession.id]?.linkedSessionId
              ? store.sessions.find(s => s.id === completedSessions[selectedSession.id].linkedSessionId)
              : null
          }
          allSessions={store.sessions}
          onMarkDone={(linkedSessionId) => store.markPlanSessionDone(selectedSession.id, linkedSessionId)}
          onUnmark={() => store.unmarkPlanSessionDone(selectedSession.id)}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  )
}
