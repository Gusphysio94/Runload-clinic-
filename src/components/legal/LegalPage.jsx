import { Card } from '../ui/Card'

export function LegalPage() {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          À propos &amp; Mentions légales
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Informations sur l'application, conditions d'utilisation et données personnelles
        </p>
      </div>

      {/* Avertissement santé */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800" style={{ fontFamily: 'var(--font-heading)' }}>
              Avertissement important
            </h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              RunLoad Clinic est un <strong>outil d'aide à la décision clinique</strong> destiné aux professionnels de santé
              formés à la gestion de la charge d'entraînement en course à pied. Il ne constitue en aucun cas un
              dispositif médical au sens de la réglementation européenne (MDR 2017/745).
            </p>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Les scores, alertes et recommandations générés par l'application sont fournis à titre informatif
              et ne remplacent pas le raisonnement clinique du praticien. Toute décision thérapeutique relève
              de la responsabilité exclusive du professionnel de santé.
            </p>
          </div>
        </div>
      </Card>

      {/* Mentions légales */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Mentions légales
        </h3>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <div>
            <p className="font-medium text-text-primary">Éditeur</p>
            <p>Augustin Castel — Kinésithérapeute du sport et thérapeute manuel</p>
            <p>Contact : castelphysio94@gmail.com</p>
          </div>
          <div>
            <p className="font-medium text-text-primary">Hébergement</p>
            <p>Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
          </div>
          <div>
            <p className="font-medium text-text-primary">Développement</p>
            <p>Application développée avec l'assistance de Claude (Anthropic).</p>
          </div>
        </div>
      </Card>

      {/* Données personnelles */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Données personnelles &amp; confidentialité
        </h3>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div>
              <p className="font-medium text-emerald-800">Aucune donnée ne quitte votre navigateur</p>
              <p className="text-emerald-700 mt-1">
                Toutes les données (patients, séances, plans d'entraînement) sont stockées
                exclusivement dans le <strong>localStorage</strong> de votre navigateur. Aucune information
                n'est transmise à un serveur, une base de données externe, ou un tiers.
              </p>
            </div>
          </div>
          <p>
            <strong>Aucun cookie</strong> de tracking ou d'analyse n'est utilisé. L'application ne collecte
            aucune donnée de navigation, aucune métrique d'usage, et ne contient aucun outil d'analyse
            tiers (Google Analytics, etc.).
          </p>
          <p>
            <strong>Conséquence :</strong> si vous changez de navigateur, videz le cache, ou utilisez un autre
            appareil, les données ne seront pas disponibles. Il est recommandé d'exporter régulièrement
            les bilans via la fonction d'export PDF.
          </p>
          <p>
            En tant que professionnel de santé, vous restez responsable de la conformité de votre
            utilisation de l'outil avec les obligations déontologiques et réglementaires applicables
            à la gestion des données de santé de vos patients.
          </p>
        </div>
      </Card>

      {/* Références scientifiques */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Références scientifiques
        </h3>
        <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
          <p className="text-xs text-text-muted mb-3">
            Les modèles et algorithmes de l'application s'appuient sur les publications suivantes :
          </p>
          <ul className="space-y-2">
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Score de risque composite &amp; ACWR</strong> — Gabbett TJ. (2016).
              The training-injury prevention paradox. <em>Br J Sports Med</em>, 50(5), 273-280.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>sRPE (Session Rating of Perceived Exertion)</strong> — Foster C. et al. (2001).
              A new approach to monitoring exercise training. <em>J Strength Cond Res</em>, 15(1), 109-115.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Monotonie &amp; Strain</strong> — Foster C. (1998).
              Monitoring training in athletes with reference to overtraining syndrome.
              <em> Med Sci Sports Exerc</em>, 30(7), 1164-1168.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Vitesse critique</strong> — Monod H, Scherrer J. (1965).
              The work capacity of a synergic muscular group. <em>Ergonomics</em>, 8(3), 329-338.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Seuils lactiques (LT1/LT2, Dmax)</strong> — Cheng B. et al. (1992).
              A new approach for the determination of ventilatory and lactate thresholds.
              <em> Int J Sports Med</em>, 13(7), 518-522.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Indice minimaliste</strong> — Esculier JF, Dubois B, Roy JS, Dionne CE. (2014).
              A consensus definition and rating scale for minimalist shoes.
              <em> J Foot Ankle Res</em>, 7:42.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Guide blessure &amp; base de données chaussures</strong> — La Clinique du Coureur.
              Protocoles de gestion de la charge par pathologie &amp; indices minimalistes 2024-2025.
            </li>
            <li className="pl-4 border-l-2 border-primary-200">
              <strong>Modèle polarisé 80/20</strong> — Seiler S. (2010).
              What is best practice for training intensity and duration distribution?
              <em> Int J Sports Physiol Perform</em>, 5(3), 276-291.
            </li>
          </ul>
        </div>
      </Card>

      {/* Version */}
      <div className="text-center text-xs text-text-muted py-4">
        RunLoad Clinic v1.1 — 2025
      </div>
    </div>
  )
}
