/**
 * Jauge de risque visuelle semi-circulaire.
 * Score 0-100 avec zones colorées (vert → jaune → orange → rouge).
 */
export function RiskGauge({ score, level }) {
  // Angle de l'aiguille : 0 = gauche (-90°), 100 = droite (90°)
  const angle = -90 + (score / 100) * 180
  const riskColors = {
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
  }
  const color = riskColors[level?.color] || '#94a3b8'

  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 200 120" className="w-60 h-36">
        <defs>
          {/* Glow filter for needle */}
          <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for arc segments */}
          <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>

        {/* Arc de fond */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Segments colorés */}
        <path
          d="M 20 100 A 80 80 0 0 1 60 32"
          fill="none"
          stroke="url(#greenGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 60 32 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="url(#yellowGrad)"
          strokeWidth="14"
        />
        <path
          d="M 100 20 A 80 80 0 0 1 140 32"
          fill="none"
          stroke="url(#orangeGrad)"
          strokeWidth="14"
        />
        <path
          d="M 140 32 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#redGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Aiguille avec glow */}
        <g
          transform={`rotate(${angle}, 100, 100)`}
          filter="url(#needleGlow)"
          style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <line
            x1="100" y1="100" x2="100" y2="32"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Pointe */}
          <circle cx="100" cy="34" r="3" fill={color} />
        </g>
        {/* Centre */}
        <circle cx="100" cy="100" r="7" fill={color} opacity="0.15" />
        <circle cx="100" cy="100" r="4" fill={color} />
        <circle cx="100" cy="100" r="1.5" fill="white" />
      </svg>

      <div className="text-center -mt-1">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color, fontFamily: 'var(--font-heading)' }}
          >
            {score}
          </span>
          <span className="text-sm text-text-muted font-medium">/100</span>
        </div>
        <p
          className="text-sm font-semibold mt-1.5 tracking-tight"
          style={{ color, fontFamily: 'var(--font-heading)' }}
        >
          {level?.emoji} {level?.label}
        </p>
      </div>
    </div>
  )
}
