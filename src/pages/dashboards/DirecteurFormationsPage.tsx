import { useState } from 'react'
import { BookOpen, Users, Calendar, Clock, DollarSign, Award, Plus, Eye, Edit, X, CheckCircle2, TrendingUp, Star } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { mockFormations, mockInscriptionsFormation } from '../../data/advancedData'
import type { Formation, InscriptionFormation } from '../../data/advancedData'

export const DirecteurFormationsPage = () => {
  const [formations, setFormations] = useState<Formation[]>(mockFormations)
  const [inscriptions, setInscriptions] = useState<InscriptionFormation[]>(mockInscriptionsFormation)
  const [activeTab, setActiveTab] = useState<'catalogue' | 'inscriptions' | 'stats'>('catalogue')
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')

  const [formData, setFormData] = useState({
    titre: '', description: '', formateur: '', type: 'Presentiel',
    categorie: '', date_debut: '', date_fin: '', duree_heures: '',
    cout: '', places_total: '', competences: ''
  })

  const filteredFormations = formations.filter(f => {
    const matchesCategorie = filterCategorie === 'all' || f.categorie === filterCategorie
    const matchesStatut = filterStatut === 'all' || f.statut === filterStatut
    return matchesCategorie && matchesStatut
  })

  const stats = {
    total: formations.length,
    planifiees: formations.filter(f => f.statut === 'Planifiee').length,
    enCours: formations.filter(f => f.statut === 'En_cours').length,
    terminees: formations.filter(f => f.statut === 'Terminee').length,
    totalParticipants: formations.reduce((sum, f) => sum + f.participants.length, 0),
    budgetTotal: formations.reduce((sum, f) => sum + (f.cout * f.places_total), 0),
    tauxCertification: inscriptions.length > 0 ? inscriptions.filter(i => i.certification_obtenue).length / inscriptions.length * 100 : 0
  }

  const categorieData = [
    { name: 'Management', value: formations.filter(f => f.categorie === 'Management').length, color: '#f59e0b' },
    { name: 'Technique', value: formations.filter(f => f.categorie === 'Technique').length, color: '#10b981' },
    { name: 'Methodologie', value: formations.filter(f => f.categorie === 'Methodologie').length, color: '#3b82f6' }
  ]

  const participationData = formations.map(f => ({
    nom: f.titre.substring(0, 20),
    participants: f.participants.length,
    places: f.places_total
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newFormation: Formation = {
      id: Date.now(),
      ...formData,
      type: formData.type as Formation['type'],
      categorie: formData.categorie as Formation['categorie'],
      duree_heures: parseInt(formData.duree_heures),
      cout: parseInt(formData.cout),
      places_total: parseInt(formData.places_total),
      places_restantes: parseInt(formData.places_total),
      date_debut: formData.date_debut,
      date_fin: formData.date_fin,
      statut: 'Planifiee',
      participants: [],
      competences_acquises: formData.competences.split(',').map(c => c.trim()),
      certification: true,
      evaluation_moyenne: 0
    }
    setFormations([...formations, newFormation])
    setShowCreateModal(false)
    setFormData({ titre: '', description: '', formateur: '', type: 'Presentiel', categorie: '', date_debut: '', date_fin: '', duree_heures: '', cout: '', places_total: '', competences: '' })
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Planifiee': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'En_cours': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Terminee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Annulee': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['Planifiee']
  }

  const getTypeIcon = (type: string) => {
    if (type === 'Presentiel') return '🏢'
    if (type === 'En_ligne') return '💻'
    return '🔄'
  }

  const tabs = [
    { id: 'catalogue' as const, label: 'Catalogue' },
    { id: 'inscriptions' as const, label: 'Inscriptions' },
    { id: 'stats' as const, label: 'Statistiques' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Formations & Developpement</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez le catalogue de formations</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle formation</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'from-primary-500 to-primary-600' },
          { label: 'Planifiees', value: stats.planifiees, icon: Calendar, color: 'from-primary-500 to-cyan-600' },
          { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-primary-500 to-primary-600' },
          { label: 'Terminees', value: stats.terminees, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Participants', value: stats.totalParticipants, icon: Users, color: 'from-primary-500 to-primary-600' },
          { label: 'Budget', value: '$' + (stats.budgetTotal / 1000).toFixed(0) + 'K', icon: DollarSign, color: 'from-primary-500 to-primary-600' },
          { label: 'Certif.', value: stats.tauxCertification.toFixed(0) + '%', icon: Award, color: 'from-primary-500 to-primary-600' }
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
          <div className="flex overflow-x-auto">
            {[
              { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
              { id: 'inscriptions', label: 'Inscriptions', icon: Users },
              { id: 'stats', label: 'Statistiques', icon: TrendingUp }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'catalogue' && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="all">Toutes categories</option>
                  <option value="Management">Management</option>
                  <option value="Technique">Technique</option>
                  <option value="Methodologie">Methodologie</option>
                </select>
                <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="all">Tous statuts</option>
                  <option value="Planifiee">Planifiee</option>
                  <option value="En_cours">En cours</option>
                  <option value="Terminee">Terminee</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFormations.map(formation => (
                  <div key={formation.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedFormation(formation); setShowDetailModal(true) }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{getTypeIcon(formation.type)}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(formation.statut)}`}>
                        {formation.statut.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-2">{formation.titre}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{formation.description}</p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{formation.participants.length}/{formation.places_total} participants</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formation.date_debut} → {formation.date_fin}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formation.duree_heures} heures</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-4 h-4" />
                        <span>${formation.cout} par personne</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                        {formation.categorie}
                      </span>
                      {formation.certification && (
                        <span className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                          <Award className="w-3 h-3" />
                          <span>Certifiante</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'inscriptions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Inscriptions aux formations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inscriptions.map(inscription => {
                  const formation = formations.find(f => f.id === inscription.formation_id)
                  return (
                    <div key={inscription.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">{inscription.employe_nom}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{formation?.titre}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(inscription.statut)}`}>
                          {inscription.statut.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Progression</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{inscription.progression}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${inscription.progression}%` }}></div>
                          </div>
                        </div>

                        {inscription.note_finale > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Note finale</span>
                            <span className="font-bold text-amber-600">{inscription.note_finale}/20</span>
                          </div>
                        )}

                        {inscription.certification_obtenue && (
                          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                            <Award className="w-4 h-4" />
                            <span>Certification obtenue</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par categorie</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categorieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {categorieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Participation par formation</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={participationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="nom" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="participants" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Taux de completion</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.total > 0 ? ((stats.terminees / stats.total) * 100).toFixed(0) : 0}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">des formations terminees</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Satisfaction moyenne</p>
                  <p className="text-3xl font-bold text-green-600 flex items-center">
                    {inscriptions.filter(i => i.note_finale > 0).length > 0
                      ? (inscriptions.filter(i => i.note_finale > 0).reduce((sum, i) => sum + i.note_finale, 0) / inscriptions.filter(i => i.note_finale > 0).length).toFixed(1)
                      : '0.0'} <Star className="w-6 h-6 text-green-600 fill-green-600 ml-2" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">sur 5.0</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">ROI Formation</p>
                  <p className="text-3xl font-bold text-primary-600">0%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">productivite</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouvelle formation</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Formateur</label>
                  <input type="text" value={formData.formateur} onChange={(e) => setFormData({...formData, formateur: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categorie</label>
                  <input type="text" value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Presentiel">Presentiel</option>
                    <option value="En_ligne">En ligne</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Duree (heures)</label>
                  <input type="number" value={formData.duree_heures} onChange={(e) => setFormData({...formData, duree_heures: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cout ($)</label>
                  <input type="number" value={formData.cout} onChange={(e) => setFormData({...formData, cout: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date debut</label>
                  <input type="date" value={formData.date_debut} onChange={(e) => setFormData({...formData, date_debut: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date fin</label>
                  <input type="date" value={formData.date_fin} onChange={(e) => setFormData({...formData, date_fin: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Places</label>
                  <input type="number" value={formData.places_total} onChange={(e) => setFormData({...formData, places_total: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Competences (separees par virgules)</label>
                <input type="text" value={formData.competences} onChange={(e) => setFormData({...formData, competences: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: Leadership, Communication" />
              </div>
              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Creer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedFormation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedFormation.titre}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatutColor(selectedFormation.statut)}`}>
                  {selectedFormation.statut.replace('_', ' ')}
                </span>
                <span className="text-2xl">{getTypeIcon(selectedFormation.type)}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{selectedFormation.categorie}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedFormation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Formateur</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedFormation.formateur}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Duree</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedFormation.duree_heures} heures</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Participants</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedFormation.participants.length}/{selectedFormation.places_total}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cout</p>
                  <p className="font-bold text-slate-800 dark:text-white">${selectedFormation.cout} / personne</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Competences acquises</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFormation.competences_acquises.map((comp, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {selectedFormation.evaluation_moyenne > 0 && (
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Evaluation moyenne</p>
                      <p className="text-3xl font-bold text-amber-600 flex items-center">
                        {selectedFormation.evaluation_moyenne} <Star className="w-6 h-6 text-amber-600 fill-amber-600 ml-2" />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">sur 5.0</p>
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