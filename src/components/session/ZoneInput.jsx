import { FormField, Input } from '../ui/FormField'
import { INTENSITY_ZONES, INTENSITY_REFERENCES } from '../../constants'

export function ZoneInput({ zones, onChange, totalDuration, intensityReference }) {
  const updateZone = (key, value) => {
    onChange({ ...zones, [key]: value })
  }

  const zoneKeys = ['z1', 'z2', 'z3', 'z4', 'z5']
  const totalZoneMinutes = zoneKeys.reduce((sum, key) => sum + (Number(zones[key]) || 0), 0)
  const remaining = totalDuration - totalZoneMinutes

  const refLabel = INTENSITY_REFERENCES.find(r => r.value === intensityReference)?.label || intensityReference

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Répartition par zone — Référentiel : <strong>{refLabel}</strong>
        </p>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          remaining === 0
            ? 'bg-risk-green/20 text-green-700'
            : remaining > 0
              ? 'bg-risk-yellow/20 text-yellow-700'
              : 'bg-risk-red/20 text-red-700'
        }`}>
          {remaining === 0
            ? 'Complet'
            : remaining > 0
              ? `${remaining} min restantes`
              : `${Math.abs(remaining)} min en trop`
          }
        </span>
      </div>

      <div className="space-y-2">
        {INTENSITY_ZONES.map((zone, i) => {
          const key = zoneKeys[i]
          const minutes = Number(zones[key]) || 0
          const percentage = totalDuration > 0 ? Math.round((minutes / totalDuration) * 100) : 0

          return (
            <div key={zone.zone} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-sm font-medium w-36 shrink-0">{zone.label}</span>
              <span className="text-xs text-text-muted w-20 shrink-0">
                {zone.ranges[intensityReference] || '—'}
              </span>
              <Input
                type="number"
                value={zones[key]}
                onChange={e => updateZone(key, e.target.value)}
                placeholder="min"
                className="w-20"
              />
              <span className="text-xs text-text-muted w-10">{percentage}%</span>
              {/* Barre de progression */}
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: zone.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
