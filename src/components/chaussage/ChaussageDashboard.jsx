import { useState } from 'react'
import { ShoeRotation } from './ShoeRotation'
import { ShoeTransition } from './ShoeTransition'
import { ShoeRecommendations } from './ShoeRecommendations'
import { MinimalistIndex } from '../tools/MinimalistIndex'

const TABS = [
  { id: 'rotation', label: 'Mes chaussures', desc: 'Enregistrez vos paires, suivez leur kilométrage et optimisez votre rotation.' },
  { id: 'transition', label: 'Transition', desc: 'Planifiez le passage progressif vers une chaussure plus minimaliste en toute sécurité.' },
  { id: 'recommandations', label: 'Conseils cliniques', desc: 'Consultez les recommandations de chaussage adaptées à chaque pathologie du coureur.' },
  { id: 'indice', label: 'Indice minimaliste', desc: 'Calculez le score minimaliste d\'une chaussure selon le barème Esculier et al. (2014).' },
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
          {TABS.find(t => t.id === activeTab)?.desc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1.5 border border-border shadow-sm overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-dark/40'
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
