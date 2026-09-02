import { useState } from 'react'
import { Heart, Trophy, Users, Clock, Play, BookOpen, Eye, ThumbsUp } from 'lucide-react'
import { mockDefisBienEtre, mockRessourcesBienEtre } from '../../data/phase7Data'

export const DirecteurBienEtrePage = () => {
  const [activeTab, setActiveTab] = useState<'defis' | 'ressources'>('defis')
  const defis = mockDefisBienEtre
  const ressources = mockRessourcesBienEtre

  const stats = {
    totalDefis: defis.length,
    totalParticipants: defis.reduce((sum, d) => sum + d.participants, 0),
    moyenneProgression: (defis.reduce((sum, d) => sum + d.progression_moyenne, 0) / defis.length).toFixed(0),
    totalRessources: ressources.length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Bien-etre au Travail</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Defis et ressources pour vos employes</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Programme Bien-etre RH Manager</h3>
            <p className="text-sm text-white/90 mb-3">Encouragez un mode de vie sain et equilibre au sein de votre entreprise</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ 5 categories</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Suivi de progression</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Ressources variees</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Defis actifs', value: stats.totalDefis, icon: Trophy, color: 'from-primary-500 to-primary-600' },
          { label: 'Participants', value: stats.totalParticipants, icon: Users, color: 'from-primary-500 to-primary-600' },
          { label: 'Progression moy.', value: stats.moyenneProgression + '%', icon: Trophy, color: 'from-primary-500 to-primary-600' },
          { label: 'Ressources', value: stats.totalRessources, icon: BookOpen, color: 'from-primary-500 to-cyan-600' }
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
            <button onClick={() => setActiveTab('defis')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'defis' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Defis ({defis.length})
            </button>
            <button onClick={() => setActiveTab('ressources')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'ressources' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Ressources ({ressources.length})
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'defis' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defis.map(defi => (
                <div key={defi.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${defi.couleur} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                      {defi.icone}
                    </div>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                      {defi.categorie}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{defi.titre}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{defi.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Progression moyenne</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{defi.progression_moyenne}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${defi.couleur} h-2 rounded-full transition-all`} style={{ width: `${defi.progression_moyenne}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{defi.participants} participants</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Jusqu'au {defi.date_fin.split('-').slice(1).reverse().join('/')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ressources.map(ressource => (
                <div key={ressource.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      ressource.type === 'Article' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                      ressource.type === 'Video' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                      ressource.type === 'Podcast' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600'
                    }`}>
                      {ressource.type === 'Video' ? <Play className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold">
                      {ressource.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{ressource.titre}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Par {ressource.auteur} • {ressource.duree}</p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{ressource.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                        <Eye className="w-4 h-4" />
                        <span>{ressource.vues}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 text-xs">
                      Consulter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}