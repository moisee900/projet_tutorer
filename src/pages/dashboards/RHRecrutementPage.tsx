import { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  Briefcase, Search, Plus, Eye, User, Check, X, Send, 
  Pause, Calendar, LoaderCircle, Phone, Video, TrendingUp, 
  Users, ClipboardList, Sparkles, Filter, ChevronDown, 
  Clock, MapPin, DollarSign, Mail, CalendarDays,
  AlertCircle, CheckCircle2, XCircle, Building2,
  Clock as ClockIcon, PencilLine, Award,
  MessageSquare, Bell, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { candidatAPI, entretienAPI, postulationAPI, offreAPI, posteAPI } from '../../services/api'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const RHRecrutementPage = () => {
  const [activeTab, setActiveTab] = useState<'offres' | 'candidats' | 'postulations'>('offres')
  const [searchTerm, setSearchTerm] = useState('')
  const [offres, setOffres] = useState<any[]>([])
  const [candidats, setCandidats] = useState<any[]>([])
  const [postulations, setPostulations] = useState<any[]>([])
  const [postes, setPostes] = useState<any[]>([])
  const [selectedPostes, setSelectedPostes] = useState<Record<number, string>>({})
  const [recruitmentSalaries, setRecruitmentSalaries] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [interviewPostulation, setInterviewPostulation] = useState<any | null>(null)
  const [interviewForm, setInterviewForm] = useState({
    scheduled_at: '',
    mode: 'Visioconférence' as 'Visioconférence' | 'Présentiel' | 'Téléphonique',
    lieu: '',
    note: '',
  })
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false)
  const [isSavingOffer, setIsSavingOffer] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'salaire' | 'statut'>('date')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedOffre, setSelectedOffre] = useState<any | null>(null)
  
  // Date par défaut
  const getDefaultDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const [offerForm, setOfferForm] = useState({
    titre: '',
    description: '',
    type_contrat: 'CDI',
    localisation: '',
    experience_requise: '',
    competences_requises: '',
    avantages: '',
    salaire_base: '',
    date_limite: getDefaultDate(),
  })

  const loadRecruitment = useCallback(async () => {
    setIsLoading(true)
    try {
      const [offresResponse, candidatsResponse, postulationsResponse, postesResponse] = await Promise.all([
        offreAPI.getForCompany(),
        candidatAPI.getAll(),
        postulationAPI.getAll(),
        posteAPI.getForRH(),
      ])
      setOffres(offresResponse.offres || [])
      setCandidats(candidatsResponse.candidats || [])
      setPostulations(postulationsResponse.postulations || [])
      setPostes((postesResponse.postes || []).filter((poste: any) => poste.statut === 'Vacant'))
    } catch (error) {
      setFeedback('Impossible de charger le recrutement.')
      setFeedbackType('error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRecruitment()
  }, [loadRecruitment])

  // Nettoyer les messages après 5 secondes
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback, successMsg])

  const handleRecruit = async (postulationId: number) => {
    const posteId = Number(selectedPostes[postulationId])
    const postulation = postulations.find((item) => item.id_postulation === postulationId)
    const salary = Number(recruitmentSalaries[postulationId] ?? postulation?.offre?.salaire_base ?? 0)
    
    if (!posteId) {
      setFeedback('Sélectionnez un poste vacant avant de recruter.')
      setFeedbackType('error')
      return
    }
    if (!Number.isFinite(salary) || salary <= 0) {
      setFeedback('Le salaire doit être supérieur à zéro.')
      setFeedbackType('error')
      return
    }

    setPendingAction(`recruit-${postulationId}`)
    try {
      const response = await postulationAPI.recruit(postulationId, posteId, salary)
      setSuccessMsg(`✅ Candidat recruté ! Matricule : ${response.matricule}`)
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de recruter.')
      setFeedbackType('error')
    } finally {
      setPendingAction(null)
    }
  }

  const handleReject = async (postulationId: number) => {
    setPendingAction(`reject-${postulationId}`)
    try {
      await postulationAPI.reject(postulationId)
      setSuccessMsg('✅ Candidature refusée')
      await loadRecruitment()
    } catch (error) {
      setFeedback('Impossible de refuser cette candidature.')
      setFeedbackType('error')
    } finally {
      setPendingAction(null)
    }
  }

  const scheduleInterview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!interviewPostulation) return

    setPendingAction(`interview-${interviewPostulation.id_postulation}`)
    try {
      await entretienAPI.create({ ...interviewForm, id_postulation: interviewPostulation.id_postulation })
      setSuccessMsg('✅ Entretien planifié avec succès !')
      setInterviewPostulation(null)
      setInterviewForm({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' })
      await loadRecruitment()
    } catch (error) {
      setFeedback('Impossible de planifier l\'entretien.')
      setFeedbackType('error')
    } finally {
      setPendingAction(null)
    }
  }

  const handleOfferStatus = async (offreId: number, statut: 'Publiée' | 'Archivée') => {
    try {
      await offreAPI.updateCompanyStatus(offreId, statut)
      setFeedback(statut === 'Publiée' ? '✅ Offre publiée avec succès !' : '📦 Offre archivée.')
      setFeedbackType('success')
      await loadRecruitment()
    } catch (error) {
      setFeedback('Impossible de modifier le statut.')
      setFeedbackType('error')
    }
  }

  const handleCreateOffer = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSavingOffer(true)
    setFeedback(null)

    if (!offerForm.date_limite) {
      setFeedback('La date limite est obligatoire.')
      setFeedbackType('error')
      setIsSavingOffer(false)
      return
    }

    const selectedDate = new Date(offerForm.date_limite)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      setFeedback('La date limite doit être aujourd\'hui ou dans le futur.')
      setFeedbackType('error')
      setIsSavingOffer(false)
      return
    }

    try {
      const payload = {
        ...offerForm,
        salaire_base: Number(offerForm.salaire_base),
        date_limite: offerForm.date_limite.split('T')[0],
        statut: 'Brouillon',
      }

      await offreAPI.createForCompany(payload)
      
      setFeedback('✅ Offre enregistrée en brouillon !')
      setFeedbackType('success')
      setIsOfferFormOpen(false)
      
      setOfferForm({
        titre: '',
        description: '',
        type_contrat: 'CDI',
        localisation: '',
        experience_requise: '',
        competences_requises: '',
        avantages: '',
        salaire_base: '',
        date_limite: getDefaultDate(),
      })
      await loadRecruitment()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Impossible de créer cette offre.'
      setFeedback(`❌ ${errorMessage}`)
      setFeedbackType('error')
    } finally {
      setIsSavingOffer(false)
    }
  }

  const closeOfferForm = () => {
    setIsOfferFormOpen(false)
    setFeedback(null)
  }

  // Filtres et tris
  const filteredOffres = useMemo(() => {
    return offres
      .filter(o => o.titre?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(o => filterStatus === 'all' || o.statut === filterStatus)
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sortBy === 'salaire') return b.salaire_base - a.salaire_base
        return 0
      })
  }, [offres, searchTerm, filterStatus, sortBy])

  const filteredCandidats = useMemo(() => {
    return candidats.filter(c => 
      (c.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (c.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  }, [candidats, searchTerm])

  const stats = useMemo(() => ({
    offresActives: offres.filter(o => o.statut === 'Publiée').length,
    totalCandidats: candidats.length,
    postulations: postulations.length,
    enAttente: postulations.filter(p => p.statut === 'Soumise').length,
  }), [offres, candidats, postulations])

  const statusColors: Record<string, string> = {
    'Publiée': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Brouillon': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Archivée': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    'Soumise': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'En cours': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Acceptée': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Refusée': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  const statusIcons: Record<string, any> = {
    'Publiée': CheckCircle2,
    'Brouillon': PencilLine,
    'Archivée': Archive,
    'Soumise': ClockIcon,
    'En cours': LoaderCircle,
    'Acceptée': Check,
    'Refusée': XCircle,
  }

  const statsCards = [
    { 
      label: 'Offres actives', 
      value: stats.offresActives, 
      icon: Briefcase, 
      color: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      badge: stats.offresActives > 0 ? `${stats.offresActives} en cours` : 'Aucune'
    },
    { 
      label: 'Candidats', 
      value: stats.totalCandidats, 
      icon: Users, 
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      badge: stats.totalCandidats > 0 ? 'En attente' : 'Aucun'
    },
    { 
      label: 'Postulations', 
      value: stats.postulations, 
      icon: ClipboardList, 
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      badge: stats.postulations > 0 ? 'À traiter' : 'Aucune'
    },
    { 
      label: 'En attente', 
      value: stats.enAttente, 
      icon: Clock, 
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      badge: stats.enAttente > 0 ? 'Urgent' : 'OK'
    },
  ]

  const totalActivities = stats.offresActives + stats.postulations + stats.totalCandidats

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen"
    >
      {/* Header avec animations */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5"
          animate={{
            x: ['-100%', '100%'],
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <motion.div 
              variants={floatAnimation}
              animate="animate"
              className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/30"
            >
              <Briefcase className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
                Gestion du Recrutement
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                    <Sparkles className="w-3 h-3" />
                    {totalActivities} activités
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                    <TrendingUp className="w-3 h-3" />
                    {stats.totalCandidats} candidats
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-300">
                    <Clock className="w-3 h-3" />
                    {stats.enAttente} en attente
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOfferFormOpen(true)} 
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle offre</span>
              <span className="hidden sm:inline bg-white/20 px-1.5 py-0.5 rounded text-xs">+</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Feedback messages améliorés */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 shadow-lg ${
              feedbackType === 'success' 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 shadow-emerald-500/10'
                : feedbackType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 shadow-red-500/10'
                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300'
            }`}
          >
            {feedbackType === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="flex-1">{feedback}</span>
            <button onClick={() => setFeedback(null)} className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success toast flottant */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed right-5 top-5 z-[70] max-w-sm rounded-2xl border border-white/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-950 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 shrink-0" />
              <span className="flex-1">{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:opacity-70 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards améliorés */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        {statsCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 300 }
            }}
            className={`${stat.bg} dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm transition-all duration-300 group relative overflow-hidden`}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ['-100%', '100%'],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                <motion.p 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200 }}
                  className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-white mt-1"
                >
                  {stat.value}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                >
                  {stat.badge}
                </motion.p>
                <div className="mt-2 h-1 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / (totalActivities || 1)) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                  />
                </div>
              </div>
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all`}
              >
                <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </motion.div>
            </div>
            
            <motion.div 
              className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-gradient-to-r from-white/5 to-transparent -mb-16 -mr-16"
              animate={{
                scale: [1, 1.2, 1],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs avec filtres améliorés */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl overflow-hidden"
      >
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between p-4">
            <div className="flex overflow-x-auto gap-1">
              {[
                { id: 'offres', label: 'Offres', icon: Briefcase, count: stats.offresActives, color: 'from-violet-500 to-indigo-600' },
                { id: 'candidats', label: 'Candidats', icon: Users, count: stats.totalCandidats, color: 'from-blue-500 to-cyan-600' },
                { id: 'postulations', label: 'Postulations', icon: ClipboardList, count: stats.postulations, color: 'from-emerald-500 to-teal-600' },
              ].map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 dark:from-primary-900/30 dark:to-primary-900/20 dark:text-primary-400 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                >
                  <option value="all">Tous</option>
                  <option value="Publiée">Publiée</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Archivée">Archivée</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                >
                  <option value="date">Trier par date</option>
                  <option value="salaire">Trier par salaire</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              {/* Vue Grid/List */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative mb-6 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Rechercher dans ${activeTab === 'offres' ? 'les offres' : activeTab === 'candidats' ? 'les candidats' : 'les postulations'}...`} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400 group-focus:bg-white dark:group-focus:bg-slate-700" 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400"></div>
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-300 dark:border-t-primary-200"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <p className="text-slate-500 dark:text-slate-400 mt-4">Chargement des données...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'offres' && (
                <motion.div
                  key="offres"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}
                >
                  {filteredOffres.length === 0 ? (
                    <div className="col-span-2 text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Briefcase className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      </motion.div>
                      <p className="text-slate-500 dark:text-slate-400">Aucune offre trouvée</p>
                      <button 
                        onClick={() => setIsOfferFormOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une offre
                      </button>
                    </div>
                  ) : (
                    filteredOffres.map((offre, index) => (
                      <motion.div
                        key={offre.id_offre}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group"
                        onClick={() => setSelectedOffre(offre)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              {offre.titre}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[offre.statut] || 'bg-slate-100 text-slate-700'}`}>
                                {offre.statut}
                              </span>
                            </h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {offre.localisation}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {offre.type_contrat}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {offre.date_limite}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {Number(offre.salaire_base).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {offre.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {offre.postulations_count || 0} candidatures
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {offre.statut === 'Brouillon' && (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); void handleOfferStatus(offre.id_offre, 'Publiée') }} 
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <Send className="h-3.5 w-3.5" /> Publier
                              </motion.button>
                            )}
                            {offre.statut === 'Publiée' && (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); void handleOfferStatus(offre.id_offre, 'Archivée') }} 
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors shadow-sm"
                              >
                                <Pause className="h-3.5 w-3.5" /> Archiver
                              </motion.button>
                            )}
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); setSelectedOffre(offre) }}
                              className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'candidats' && (
                <motion.div
                  key="candidats"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3"
                >
                  {filteredCandidats.length === 0 ? (
                    <div className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      </motion.div>
                      <p className="text-slate-500 dark:text-slate-400">Aucun candidat trouvé</p>
                    </div>
                  ) : (
                    filteredCandidats.map((candidat, index) => (
                      <motion.div
                        key={candidat.id_candidat}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4, backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md"
                          >
                            <span className="text-white font-bold text-sm">
                              {candidat.prenom?.[0] || candidat.nom?.[0] || '?'}
                            </span>
                          </motion.div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{candidat.prenom} {candidat.nom}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {candidat.email}
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                              <Phone className="w-3 h-3" />
                              {candidat.telephone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 rounded-lg hover:bg-primary-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <Award className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'postulations' && (
                <motion.div
                  key="postulations"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3"
                >
                  {postulations.length === 0 ? (
                    <div className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <ClipboardList className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      </motion.div>
                      <p className="text-slate-500 dark:text-slate-400">Aucune postulation trouvée</p>
                    </div>
                  ) : (
                    postulations.map((post, index) => {
                      const candidat = candidats.find(c => c.id_candidat === post.id_candidat)
                      const offre = offres.find(o => o.id_offre === post.id_offre)
                      const StatusIcon = statusIcons[post.statut] || ClockIcon
                      return (
                        <motion.div
                          key={post.id_postulation}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                {post.candidat?.prenom ?? candidat?.prenom} {post.candidat?.nom ?? candidat?.nom}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                Postule pour: <span className="font-semibold">{post.offre?.titre ?? offre?.titre}</span>
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColors[post.statut] || 'bg-slate-100 text-slate-700'}`}>
                              <StatusIcon className="w-3 h-3" />
                              {post.statut || 'Soumise'}
                            </span>
                          </div>
                          
                          {post.statut === 'Soumise' && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <select
                                value={selectedPostes[post.id_postulation] || ''}
                                onChange={(e) => setSelectedPostes({ ...selectedPostes, [post.id_postulation]: e.target.value })}
                                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                              >
                                <option value="">Poste vacant</option>
                                {postes.map((poste) => (
                                  <option key={poste.id_poste} value={poste.id_poste}>{poste.titre_poste}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={recruitmentSalaries[post.id_postulation] ?? post.offre?.salaire_base ?? ''}
                                onChange={(e) => setRecruitmentSalaries({ ...recruitmentSalaries, [post.id_postulation]: e.target.value })}
                                className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                                placeholder="Salaire"
                              />
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setInterviewPostulation(post); setInterviewForm({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' }) }} 
                                disabled={pendingAction !== null} 
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                              >
                                <Calendar className="h-4 w-4" /> Entretien
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => void handleRecruit(post.id_postulation)} 
                                disabled={pendingAction !== null} 
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
                              >
                                {pendingAction === `recruit-${post.id_postulation}` ? 
                                  <LoaderCircle className="h-4 w-4 animate-spin" /> : 
                                  <Check className="h-4 w-4" />
                                } Recruter
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => void handleReject(post.id_postulation)} 
                                disabled={pendingAction !== null} 
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-sm"
                              >
                                {pendingAction === `reject-${post.id_postulation}` ? 
                                  <LoaderCircle className="h-4 w-4 animate-spin" /> : 
                                  <X className="h-4 w-4" />
                                } Refuser
                              </motion.button>
                            </div>
                          )}
                          
                          {post.statut === 'Entretien' && post.entretiens?.[0] && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200 flex items-center gap-2"
                            >
                              <CalendarDays className="w-4 h-4" />
                              <span className="font-semibold">Entretien:</span> 
                              {new Date(post.entretiens[0].scheduled_at).toLocaleString('fr-FR')} · 
                              {post.entretiens[0].mode} · {post.entretiens[0].lieu}
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Interview Modal amélioré */}
      <AnimatePresence>
        {interviewPostulation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => setInterviewPostulation(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={scheduleInterview}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Planifier un entretien
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {interviewPostulation.candidat?.prenom} {interviewPostulation.candidat?.nom}
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <Briefcase className="w-3 h-3" />
                      {interviewPostulation.offre?.titre}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setInterviewPostulation(null)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Date et heure *
                    </label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={interviewForm.scheduled_at} 
                      onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      Mode *
                    </label>
                    <select 
                      value={interviewForm.mode} 
                      onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value as typeof interviewForm.mode, lieu: '' })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option>Visioconférence</option>
                      <option>Téléphonique</option>
                      <option>Présentiel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {interviewForm.mode === 'Visioconférence' ? 'Lien de visioconférence *' : 
                       interviewForm.mode === 'Téléphonique' ? 'Numéro à appeler *' : 
                       'Lieu de rendez-vous *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {interviewForm.mode === 'Visioconférence' ? <Video className="h-4 w-4" /> : 
                         <Phone className="h-4 w-4" />}
                      </span>
                      <input 
                        required 
                        type={interviewForm.mode === 'Visioconférence' ? 'url' : 'text'} 
                        placeholder={
                          interviewForm.mode === 'Visioconférence' ? 'https://meet.example.com/...' : 
                          interviewForm.mode === 'Téléphonique' ? '+243 ...' : 
                          'Adresse ou salle'
                        } 
                        value={interviewForm.lieu} 
                        onChange={(e) => setInterviewForm({ ...interviewForm, lieu: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      Note pour le candidat
                    </label>
                    <textarea 
                      rows={3} 
                      value={interviewForm.note} 
                      onChange={(e) => setInterviewForm({ ...interviewForm, note: e.target.value })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
                      placeholder="Informations supplémentaires pour le candidat..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                  <button 
                    type="button" 
                    onClick={() => setInterviewPostulation(null)} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={pendingAction !== null} 
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {pendingAction ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} 
                    Planifier
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Offer Modal amélioré */}
      <AnimatePresence>
        {isOfferFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={closeOfferForm}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleCreateOffer}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-10">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                      Nouvelle offre d'emploi
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Tous les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={closeOfferForm} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Intitulé <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        value={offerForm.titre} 
                        onChange={(e) => setOfferForm({ ...offerForm, titre: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                        placeholder="Développeur Full Stack"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Type de contrat <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={offerForm.type_contrat} 
                        onChange={(e) => setOfferForm({ ...offerForm, type_contrat: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                      >
                        <option>CDI</option>
                        <option>CDD</option>
                        <option>Stage</option>
                        <option>Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Localisation <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        value={offerForm.localisation} 
                        onChange={(e) => setOfferForm({ ...offerForm, localisation: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                        placeholder="Paris, France"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Salaire mensuel (USD) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        min="0" 
                        type="number" 
                        value={offerForm.salaire_base} 
                        onChange={(e) => setOfferForm({ ...offerForm, salaire_base: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                        placeholder="3000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Date limite <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        type="date" 
                        value={offerForm.date_limite} 
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setOfferForm({ ...offerForm, date_limite: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                      />
                      <p className="mt-1 text-xs text-slate-400">📅 La date doit être aujourd'hui ou dans le futur</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Expérience requise <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        value={offerForm.experience_requise} 
                        onChange={(e) => setOfferForm({ ...offerForm, experience_requise: e.target.value })} 
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                        placeholder="3 ans minimum"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      required 
                      rows={3} 
                      value={offerForm.description} 
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                      placeholder="Description détaillée du poste..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Compétences requises <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      required 
                      rows={2} 
                      value={offerForm.competences_requises} 
                      onChange={(e) => setOfferForm({ ...offerForm, competences_requises: e.target.value })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                      placeholder="PHP, Laravel, React, MySQL..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      Avantages <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      required 
                      rows={2} 
                      value={offerForm.avantages} 
                      onChange={(e) => setOfferForm({ ...offerForm, avantages: e.target.value })} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
                      placeholder="Tickets restaurant, mutuelle, télétravail..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                  <button 
                    type="button" 
                    onClick={closeOfferForm} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSavingOffer} 
                    type="submit" 
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSavingOffer ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Enregistrer le brouillon
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles CSS pour animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </motion.div>
  )
}

// Component Archive pour l'icône
const Archive = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="5" x="2" y="4" rx="2"/>
    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/>
    <path d="M10 13h4"/>
  </svg>
)