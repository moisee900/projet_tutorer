import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, FileText, DollarSign, Users, BookOpen, Search, Filter, Eye, Calendar } from 'lucide-react'
import { mockDemandesApprobation } from '../../data/phase6Data'
import type { DemandeApprobation } from '../../data/phase6Data'

export const DirecteurApprobationsPage = () => {
  const [demandes, setDemandes] = useState<DemandeApprobation[]>(mockDemandesApprobation)
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedDemande, setSelectedDemande] = useState<DemandeApprobation | null>(null)

  const filteredDemandes = demandes.filter(d => {
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut
    const matchesType = filterType === 'all' || d.type === filterType
    return matchesStatut && matchesType
  })

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'En_attente').length,
    approuvees: demandes.filter(d => d.statut === 'Approuvee').length,
    refusees: demandes.filter(d => d.statut === 'Refusee').length
  }

  const handleApprouver = (id: number) => {
    setDemandes(demandes.map(d => d.id === id ? { ...d, statut: 'Approuvee' as const } : d))
  }

  const handleRefuser = (id: number) => {
    setDemandes(demandes.map(d => d.id === id ? { ...d, statut: 'Refusee' as const } : d))
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'conge': Calendar,
      'note_frais': DollarSign,
      'recrutement': Users,
      'formation': BookOpen
    }
    return icons[type] || FileText
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'En_attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Approuvee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Refusee': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['En_attente']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Approbations</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez les demandes en attente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-primary-500 to-primary-600' },
          { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'from-primary-500 to-primary-600' },
          { label: 'Approuvees', value: stats.approuvees, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Refusees', value: stats.refusees, icon: XCircle, color: 'from-red-500 to-primary-600' }
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
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="En_attente">En attente</option>
            <option value="Approuvee">Approuvees</option>
            <option value="Refusee">Refusees</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous types</option>
            <option value="conge">Conges</option>
            <option value="note_frais">Notes de frais</option>
            <option value="recrutement">Recrutement</option>
            <option value="formation">Formations</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDemandes.map(demande => {
          const TypeIcon = getTypeIcon(demande.type)
          return (
            <div key={demande.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    demande.type === 'conge' ? 'bg-green-100 dark:bg-green-900/30' :
                    demande.type === 'note_frais' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    demande.type === 'recrutement' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-primary-100 dark:bg-primary-900/30'
                  }`}>
                    <TypeIcon className={`w-6 h-6 ${
                      demande.type === 'conge' ? 'text-green-600' :
                      demande.type === 'note_frais' ? 'text-amber-600' :
                      demande.type === 'recrutement' ? 'text-blue-600' :
                      'text-primary-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 dark:text-white">{demande.titre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(demande.statut)}`}>
                        {demande.statut.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{demande.demandeur} • {demande.date_demande}</p>
                    {demande.montant && <p className="text-sm font-semibold text-amber-600">Montant: ${demande.montant}</p>}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Progression</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{demande.etape_actuelle}/{demande.total_etapes}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${demande.total_etapes > 0 ? Math.min((demande.etape_actuelle / demande.total_etapes) * 100, 100) : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                {demande.statut === 'En_attente' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleApprouver(demande.id)} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approuver</span>
                    </button>
                    <button onClick={() => handleRefuser(demande.id)} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 flex items-center space-x-1">
                      <XCircle className="w-4 h-4" />
                      <span>Refuser</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}