import { useState } from 'react'
import { ShoeRotation } from './ShoeRotation'
import { ShoeTransition } from './ShoeTransition'
import { ShoeRecommendations } from './ShoeRecommendations'
import { MinimalistIndex } from '../tools/MinimalistIndex'

const TABS = [
  { id: 'rotation', label: 'Mes chaussures' },
  { id: 'transition', label: 'Transition' },
  { id: 'recommandations', label: 'Conseils cliniques' },
  { id: 'indice', label: 'Indice minimaliste' },
]

export function ChaussageDashboard({ patient, store }) {
  const [activeTab, setActiveTab] = useState('rotation')

  const shoes = patient?.shoes || []

  const handleUpdateShoes = (updatedShoes) => {
    if (store?.updatePatient) {
      store.updatePatient({ shoes: updatedShoes })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Chaussage
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Gestion du parc de chaussures, transition minimaliste et conseils cliniques
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-dark/30 rounded-xl p-1 border border-border/40 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'rotation' && (
        <ShoeRotation
          shoes={shoes}
          onUpdate={handleUpdateShoes}
          patient={patient}
        />
      )}
      {activeTab === 'transition' && (
        <ShoeTransition
          shoes={shoes}
          patient={patient}
        />
      )}
      {activeTab === 'recommandations' && (
        <ShoeRecommendations
          patient={patient}
          shoes={shoes}
        />
      )}
      {activeTab === 'indice' && (
        <MinimalistIndex />
      )}
    </div>
  )
}
