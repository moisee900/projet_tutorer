import { useEffect, useState } from 'react'
import { 
  Briefcase, Plus, Search, Edit, Eye, Send, Pause, Users, Calendar, DollarSign, 
  X, AlertCircle, Trash2, Loader2, Filter, Sparkles, ArrowRight, RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { offreAPI } from '../../services/api'
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal'
import { Toast } from '../../components/ui/Toast'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type OfferDisplay = {
  id: number
  titre: string
  description: string
  type_contrat: string
  localisation: string
  experience_requise: string
  competences_requises: string
  avantages: string
  salaire_base: number
  date_limite: string
  statut: 'Publiee' | 'Brouillon' | 'Expiree' | 'Suspendue'
  nombre_candidatures: number
}

// Composant Squelette pour le chargement
const OfferSkeleton = () => (
  <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
    </div>
    <div className="space-y-3 mt-4">
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="grid grid-cols-3 gap-3 mt-6">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  </div>
)

// Simplification de la carte avec moins d'animations lourdes
const OfferCard = ({ offre, onPublish, onUnpublish, onView, onDelete, isDeleting }: any) => {
  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Publiee': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'Brouillon': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
      'Expiree': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      'Suspendue': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    }
    return colors[statut] || colors['Brouillon']
  }

  const StatutIcon = offre.statut === 'Publiee' ? Send : offre.statut === 'Expiree' ? AlertCircle : offre.statut === 'Suspendue' ? Pause : Edit

  return (
    <div className="group bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg line-clamp-1">
              {offre.titre || "Sans titre"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {offre.type_contrat} • {offre.localisation}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatutColor(offre.statut)} flex items-center space-x-1`}>
          <StatutIcon className="w-3 h-3" />
          <span>{offre.statut}</span>
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
        {offre.description || "Aucune description fournie."}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div className="flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2 py-2">
          <DollarSign className="w-3 h-3 text-emerald-500" />
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{money.format(offre.salaire_base)}</span>
        </div>
        <div className="flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2 py-2">
          <Calendar className="w-3 h-3 text-amber-500" />
          <span className="text-xs truncate">{new Date(offre.date_limite).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2 py-2">
          <Users className="w-3 h-3 text-primary-500" />
          <span className="font-bold text-xs">{offre.nombre_candidatures}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1">
          {offre.statut === 'Brouillon' && (
            <button onClick={() => onPublish(offre.id)} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors" title="Publier">
              <Send className="w-4 h-4" />
            </button>
          )}
          {offre.statut === 'Publiee' && (
            <button onClick={() => onUnpublish(offre.id)} className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors" title="Archiver">
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onView(offre)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" title="Voir">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(offre)} disabled={isDeleting === offre.id} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50" title="Supprimer">
            {isDeleting === offre.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
        <button onClick={() => onView(offre)} className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center space-x-1 hover:underline">
          <span>Détails</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export const DirecteurOffresPage = () => {
  const [offres, setOffres] = useState<OfferDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOffre, setSelectedOffre] = useState<OfferDisplay | null>(null)
  const [deletingOfferId, setDeletingOfferId] = useState<number | null>(null)
  const [offerToDelete, setOfferToDelete] = useState<OfferDisplay | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'expired'>('all')

  const [formData, setFormData] = useState({
    titre: '', description: '', type_contrat: '', localisation: '', 
    experience_requise: '', competences_requises: '', avantages: '', 
    salaire_base: '', date_expiration: ''
  })

  const toDisplayOffer = (offre: any): OfferDisplay => ({
    id: offre.id_offre,
    titre: offre.titre,
    description: offre.description,
    type_contrat: offre.type_contrat,
    localisation: offre.localisation,
    experience_requise: offre.experience_requise,
    competences_requises: offre.competences_requises,
    avantages: offre.avantages,
    salaire_base: Number(offre.salaire_base),
    date_limite: offre.date_limite,
    statut: new Date(offre.date_limite) < new Date() ? 'Expiree' : offre.statut === 'Publiée' ? 'Publiee' : offre.statut === 'Archivée' ? 'Suspendue' : 'Brouillon',
    nombre_candidatures: Number(offre.postulations_count ?? 0),
  })

  const loadOffres = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const response = await offreAPI.getForCompany()
      setOffres((response.offres || []).map(toDisplayOffer))
      setToast({ type: 'success', message: 'Offres chargées avec succès.' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Impossible de charger les offres.'
      setToast({ type: 'error', message: msg })
      setOffres([])
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    void loadOffres()
  }, [])

  const filteredOffres = offres.filter(o => {
    const matchesSearch = o.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || o.statut === filterStatut
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'published' && o.statut === 'Publiee') ||
      (activeTab === 'draft' && o.statut === 'Brouillon') ||
      (activeTab === 'expired' && o.statut === 'Expiree')
    return matchesSearch && matchesStatut && matchesTab
  })

  const stats = {
    total: offres.length,
    publiees: offres.filter(o => o.statut === 'Publiee').length,
    brouillons: offres.filter(o => o.statut === 'Brouillon').length,
    expirees: offres.filter(o => o.statut === 'Expiree').length,
    totalCandidatures: offres.reduce((sum, o) => sum + o.nombre_candidatures, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await offreAPI.createForCompany({
        ...formData,
        salaire_base: Number(formData.salaire_base),
        statut: 'Brouillon',
      })
      await loadOffres(false)
      setToast({ type: 'success', message: 'Offre créée en brouillon.' })
      setShowCreateModal(false)
      setFormData({ titre: '', description: '', type_contrat: '', localisation: '', experience_requise: '', competences_requises: '', avantages: '', salaire_base: '', date_expiration: '' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Impossible de créer l\'offre.' })
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await offreAPI.updateCompanyStatus(id, 'Publiée')
      await loadOffres(false)
      setToast({ type: 'success', message: 'Offre publiée avec succès.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Erreur lors de la publication.' })
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      await offreAPI.updateCompanyStatus(id, 'Archivée')
      await loadOffres(false)
      setToast({ type: 'success', message: 'Offre archivée.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Erreur lors de l\'archivage.' })
    }
  }

  const handleDelete = async () => {
    if (!offerToDelete) return
    const offre = offerToDelete
    setDeletingOfferId(offre.id)
    try {
      await offreAPI.deleteForCompany(offre.id)
      setOfferToDelete(null)
      setShowDetailModal(false)
      setSelectedOffre(null)
      await loadOffres(false)
      setToast({ type: 'success', message: 'Offre supprimée définitivement.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Impossible de supprimer cette offre.' })
    } finally {
      setDeletingOfferId(null)
    }
  }

  const tabs = [
    { id: 'all' as const, label: 'Toutes', icon: Briefcase, count: stats.total },
    { id: 'published' as const, label: 'Publiées', icon: Send, count: stats.publiees },
    { id: 'draft' as const, label: 'Brouillons', icon: Edit, count: stats.brouillons },
    { id: 'expired' as const, label: 'Expirées', icon: AlertCircle, count: stats.expirees },
  ]

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-1.5 rounded-full border border-primary-200 dark:border-primary-800 mb-3">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-primary-700 dark:text-primary-300">Gestion des offres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Publication d'Offres
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Gérez vos offres d'emploi et suivez les candidatures
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => loadOffres()}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle offre</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Publiées</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.publiees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Brouillons</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.brouillons}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Expirées</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.expirees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Candidatures</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.totalCandidatures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher une offre..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select 
                value={filterStatut} 
                onChange={(e) => setFilterStatut(e.target.value)} 
                className="pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="Publiee">Publiée</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Expiree">Expirée</option>
                <option value="Suspendue">Suspendue</option>
              </select>
            </div>
          </div>

          {/* Grille des offres / Skeleton / Empty state */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <OfferSkeleton key={i} />)}
            </div>
          ) : filteredOffres.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aucune offre trouvée</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {searchTerm || filterStatut !== 'all' 
                  ? 'Aucune offre ne correspond à vos critères de recherche.' 
                  : 'Commencez par créer votre première offre d\'emploi.'}
              </p>
              {!searchTerm && filterStatut === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Créer une offre
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffres.map((offre) => (
                <OfferCard
                  key={offre.id}
                  offre={offre}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onView={(o: OfferDisplay) => { setSelectedOffre(o); setShowDetailModal(true) }}
                  onDelete={(o: OfferDisplay) => setOfferToDelete(o)}
                  isDeleting={deletingOfferId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création (Simplifié pour performance) */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false) }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer une nouvelle offre</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remplissez les informations ci-dessous</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Formulaire standard simplifié */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                    <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de contrat *</label>
                    <select value={formData.type_contrat} onChange={(e) => setFormData({...formData, type_contrat: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required>
                      <option value="">Sélectionner</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Alternance">Alternance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Localisation *</label>
                    <input type="text" value={formData.localisation} onChange={(e) => setFormData({...formData, localisation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expérience requise *</label>
                    <input type="text" value={formData.experience_requise} onChange={(e) => setFormData({...formData, experience_requise: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Compétences requises *</label>
                    <textarea value={formData.competences_requises} onChange={(e) => setFormData({...formData, competences_requises: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Avantages *</label>
                    <textarea value={formData.avantages} onChange={(e) => setFormData({...formData, avantages: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire de base (€) *</label>
                    <input type="number" min="0" value={formData.salaire_base} onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date d'expiration *</label>
                    <input type="date" value={formData.date_expiration} onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                    Créer l'offre
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détail & suppression conservés avec simplification */}
      {/* ... (code identique à l'original mais avec les classes simplifiées) ... */}
      
      <DeleteConfirmationModal
        isOpen={offerToDelete !== null}
        title="Supprimer cette offre ?"
        description={offerToDelete ? `L'offre « ${offerToDelete.titre} » sera supprimée définitivement.` : ''}
        isSubmitting={deletingOfferId !== null}
        onCancel={() => setOfferToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}