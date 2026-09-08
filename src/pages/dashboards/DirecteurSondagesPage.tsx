import { useState } from 'react'
import { FileText, Plus, Search, Eye, Edit, Trash2, BarChart3, Clock, Users, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { mockSondages } from '../../data/phase7Data'
import type { Sondage } from '../../data/phase7Data'

export const DirecteurSondagesPage = () => {
  const [sondages] = useState<Sondage[]>(mockSondages)
  const [activeTab, setActiveTab] = useState<'liste' | 'resultats'>('liste')
  const [selectedSondage, setSelectedSondage] = useState<Sondage | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterStatut, setFilterStatut] = useState('all')

  const filteredSondages = sondages.filter(s => filterStatut === 'all' || s.statut === filterStatut)

  const stats = {
    total: sondages.length,
    actifs: sondages.filter(s => s.statut === 'Actif').length,
    termines: sondages.filter(s => s.statut === 'Termine').length,
    brouillons: sondages.filter(s => s.statut === 'Brouillon').length,
    totalReponses: sondages.reduce((sum, s) => sum + s.total_reponses, 0)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Actif': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Termine': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Brouillon': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
    return colors[statut] || colors['Brouillon']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Sondages & Enquetes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Collectez les avis de vos employes</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
          <Plus className="w-5 h-5" />
          <span>Nouveau sondage</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-primary-500 to-primary-600' },
          { label: 'Actifs', value: stats.actifs, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Termines', value: stats.termines, icon: BarChart3, color: 'from-primary-500 to-cyan-600' },
          { label: 'Brouillons', value: stats.brouillons, icon: FileText, color: 'from-slate-500 to-slate-600' },
          { label: 'Reponses totales', value: stats.totalReponses, icon: Users, color: 'from-primary-500 to-primary-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button onClick={() => setActiveTab('liste')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'liste' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Liste des sondages
            </button>
            <button onClick={() => setActiveTab('resultats')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'resultats' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Resultats globaux
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'liste' ? (
            <>
              <div className="mb-4">
                <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="all">Tous statuts</option>
                  <option value="Actif">Actifs</option>
                  <option value="Termine">Termines</option>
                  <option value="Brouillon">Brouillons</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSondages.map(sondage => (
                  <div key={sondage.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white">{sondage.titre}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Par {sondage.auteur}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(sondage.statut)}`}>
                        {sondage.statut}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{sondage.description}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{sondage.total_reponses} reponses</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>Jusqu'au {sondage.date_fin}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button onClick={() => { setSelectedSondage(sondage); setShowDetailModal(true) }} className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 flex items-center justify-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </button>
                      <button className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par categorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={[
                      { name: 'RH', value: 2, color: '#f59e0b' },
                      { name: 'Evenement', value: 1, color: '#10b981' },
                      { name: 'Formation', value: 1, color: '#8b5cf6' },
                      { name: 'General', value: 1, color: '#3b82f6' }
                      ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                      {[
                        { name: 'RH', value: 2, color: '#f59e0b' },
                        { name: 'Evenement', value: 1, color: '#10b981' },
                        { name: 'Formation', value: 1, color: '#8b5cf6' },
                        { name: 'General', value: 1, color: '#3b82f6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Taux de participation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sondages.filter(s => s.total_reponses > 0).map(s => ({ titre: s.titre.substring(0, 15), reponses: s.total_reponses }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="titre" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="reponses" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedSondage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedSondage.titre}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-slate-600 dark:text-slate-400">{selectedSondage.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reponses</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedSondage.total_reponses}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedSondage.questions.length}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Questions et reponses</h4>
                <div className="space-y-4">
                  {selectedSondage.questions.map(q => (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="font-semibold text-slate-800 dark:text-white mb-3">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{opt}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${selectedSondage.total_reponses > 0 ? Math.min(((q.reponses?.[i] || 0) / selectedSondage.total_reponses) * 100, 100) : 0}%` }}></div>
                              </div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-white">{q.reponses?.[i] || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}