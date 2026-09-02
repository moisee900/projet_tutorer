import { useState } from 'react'
import { Users, Calendar, Award, Plus, Eye, Clock, CheckCircle2, PauseCircle } from 'lucide-react'
import { mockBinomesMentorat } from '../../data/phase7Data'
import type { BinomeMentorat } from '../../data/phase7Data'

export const DirecteurMentoratPage = () => {
  const [binomes] = useState<BinomeMentorat[]>(mockBinomesMentorat)
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedBinome, setSelectedBinome] = useState<BinomeMentorat | null>(null)

  const filteredBinomes = binomes.filter(b => filterStatut === 'all' || b.statut === filterStatut)

  const stats = {
    total: binomes.length,
    actifs: binomes.filter(b => b.statut === 'Actif').length,
    termines: binomes.filter(b => b.statut === 'Termine').length,
    totalSessions: binomes.reduce((sum, b) => sum + b.nombre_sessions, 0)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Actif': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Termine': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'En_pause': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    }
    return colors[statut] || colors['Actif']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Programme de Mentorat</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Developpez les talents de votre entreprise</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
          <Plus className="w-5 h-5" />
          <span>Nouveau binome</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Programme de Mentorat RH Manager</h3>
            <p className="text-sm text-white/90 mb-3">Accompagnez vos employes dans leur developpement professionnel grace au mentorat</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Binomes personnalises</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Suivi des sessions</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Objectifs definis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total binomes', value: stats.total, icon: Users, color: 'from-primary-500 to-primary-600' },
          { label: 'Actifs', value: stats.actifs, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Termines', value: stats.termines, icon: Users, color: 'from-primary-500 to-cyan-600' },
          { label: 'Sessions totales', value: stats.totalSessions, icon: Calendar, color: 'from-primary-500 to-primary-600' }
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
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
          <option value="all">Tous statuts</option>
          <option value="Actif">Actifs</option>
          <option value="Termine">Termines</option>
          <option value="En_pause">En pause</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredBinomes.map(binome => (
          <div key={binome.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(binome.statut)}`}>
                {binome.statut}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Depuis {binome.date_debut}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xl">{binome.mentor_photo}</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{binome.mentor}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mentor</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{binome.mentor_poste}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xl">{binome.mentore_photo}</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{binome.mentore}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mentore</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{binome.mentore_poste}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Expertise du mentor</p>
              <div className="flex flex-wrap gap-1">
                {binome.mentor_expertise.map((exp, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs">
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{binome.nombre_sessions} sessions</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{binome.prochaine_session ? binome.prochaine_session : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Objectifs</p>
              <ul className="space-y-1">
                {binome.objectifs.map((obj, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => setSelectedBinome(binome)} className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Voir details</span>
            </button>
          </div>
        ))}
      </div>

      {selectedBinome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details du binome</h3>
              <button onClick={() => setSelectedBinome(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-2xl">{selectedBinome.mentor_photo}</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedBinome.mentor}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBinome.mentor_poste}</p>
                  <p className="text-xs font-semibold text-amber-600 mt-2">MENTOR</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-2xl">{selectedBinome.mentore_photo}</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedBinome.mentore}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBinome.mentore_poste}</p>
                  <p className="text-xs font-semibold text-primary-600 mt-2">MENTORE</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de debut</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedBinome.date_debut}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nombre de sessions</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedBinome.nombre_sessions}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Objectifs du mentorat</h4>
                <div className="space-y-2">
                  {selectedBinome.objectifs.map((obj, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBinome.prochaine_session && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">Prochaine session</p>
                      <p className="font-bold text-amber-800 dark:text-amber-200">{selectedBinome.prochaine_session}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}