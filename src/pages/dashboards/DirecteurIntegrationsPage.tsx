import { useState } from 'react'
import { Plug, CheckCircle2, XCircle, Settings, RefreshCw, Search, Filter, ExternalLink, X, Shield, Zap } from 'lucide-react'
import { mockIntegrations } from '../../data/phase3Data'
import type { IntegrationExterne } from '../../data/phase3Data'

export const DirecteurIntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<IntegrationExterne[]>(mockIntegrations)
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationExterne | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategorie = filterCategorie === 'all' || i.categorie === filterCategorie
    const matchesStatut = filterStatut === 'all' || i.statut === filterStatut
    return matchesSearch && matchesCategorie && matchesStatut
  })

  const stats = {
    total: integrations.length,
    connectees: integrations.filter(i => i.statut === 'Connecte').length,
    deconnectees: integrations.filter(i => i.statut === 'Deconnecte').length,
    configuration: integrations.filter(i => i.statut === 'Configuration').length,
    totalSync: integrations.reduce((sum, i) => sum + i.donnees_sync, 0)
  }

  const handleToggle = (id: number) => {
    setIntegrations(integrations.map(i => {
      if (i.id === id) {
        const newStatut = i.statut === 'Connecte' ? 'Deconnecte' : 'Connecte'
        return { 
          ...i, 
          statut: newStatut,
          date_connexion: newStatut === 'Connecte' ? new Date().toISOString().split('T')[0] : undefined,
          dernier_sync: newStatut === 'Connecte' ? new Date().toLocaleString('fr-FR') : undefined
        }
      }
      return i
    }))
  }

  const handleSync = (id: number) => {
    setIntegrations(integrations.map(i => 
      i.id === id ? { ...i, dernier_sync: new Date().toLocaleString('fr-FR'), donnees_sync: i.donnees_sync + Math.floor(Math.random() * 100) } : i
    ))
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Connecte': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Deconnecte': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Configuration': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    }
    return colors[statut] || colors['Deconnecte']
  }

  const getStatutIcon = (statut: string) => {
    if (statut === 'Connecte') return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (statut === 'Configuration') return <Settings className="w-5 h-5 text-amber-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Integrations Externes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Connectez vos outils preferes a RH Manager</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <Zap className="w-5 h-5 text-green-600" />
          <span className="font-bold text-green-700 dark:text-green-300">{stats.totalSync.toLocaleString()} donnees sync</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Plug className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Ecosysteme d'integrations</h3>
            <p className="text-sm text-white/90 mb-3">Connectez RH Manager a vos outils existants pour une experience unifiee. Synchronisation automatique des donnees en temps reel.</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ API REST</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Webhooks</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ OAuth 2.0</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Chiffrement AES-256</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Plug, color: 'from-primary-500 to-primary-600' },
          { label: 'Connectees', value: stats.connectees, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Deconnectees', value: stats.deconnectees, icon: XCircle, color: 'from-red-500 to-primary-600' },
          { label: 'A configurer', value: stats.configuration, icon: Settings, color: 'from-primary-500 to-primary-600' },
          { label: 'Sync total', value: stats.totalSync.toLocaleString(), icon: RefreshCw, color: 'from-primary-500 to-cyan-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher une integration..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes categories</option>
            <option value="Communication">Communication</option>
            <option value="Comptabilite">Comptabilite</option>
            <option value="Productivite">Productivite</option>
            <option value="RH">RH</option>
            <option value="Stockage">Stockage</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Connecte">Connecte</option>
            <option value="Deconnecte">Deconnecte</option>
            <option value="Configuration">Configuration</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredIntegrations.map(integration => (
          <div key={integration.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${integration.couleur} rounded-2xl flex items-center justify-center shadow-lg text-3xl`}>
                  {integration.icone}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{integration.nom}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(integration.statut)}`}>
                    {integration.statut}
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold">{integration.plan}</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{integration.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Donnees sync</span>
                <span className="font-semibold text-slate-800 dark:text-white">{integration.donnees_sync.toLocaleString()}</span>
              </div>
              {integration.dernier_sync && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Derniere sync</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-xs">{integration.dernier_sync}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {integration.fonctionnalites.slice(0, 3).map((f, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                  {f}
                </span>
              ))}
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => { setSelectedIntegration(integration); setShowDetailModal(true) }} className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 flex items-center justify-center space-x-1">
                <Settings className="w-4 h-4" /><span>Config</span>
              </button>
              {integration.statut === 'Connecte' ? (
                <>
                  <button onClick={() => handleSync(integration.id)} className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggle(integration.id)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => handleToggle(integration.id)} className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" /><span>Connecter</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDetailModal && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedIntegration.couleur} rounded-xl flex items-center justify-center text-2xl`}>
                  {selectedIntegration.icone}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedIntegration.nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedIntegration.categorie}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-slate-600 dark:text-slate-300">{selectedIntegration.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Statut</p>
                  <div className="flex items-center space-x-2">
                    {getStatutIcon(selectedIntegration.statut)}
                    <span className="font-bold text-slate-800 dark:text-white">{selectedIntegration.statut}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Plan</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedIntegration.plan}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Donnees synchronisees</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedIntegration.donnees_sync.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Derniere sync</p>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedIntegration.dernier_sync || 'Jamais'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Fonctionnalites</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedIntegration.fonctionnalites.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIntegration.date_connexion && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <p className="font-bold text-blue-800 dark:text-blue-200">Informations de connexion</p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Connecte depuis le {selectedIntegration.date_connexion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}