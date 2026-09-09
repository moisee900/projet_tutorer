import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar, faSearch, faPlus, faCheckCircle, faTimesCircle,
  faClock, faX, faShield, faUser, faFileAlt, faCalendarAlt,
  faSortDown, faFilter, faSpinner, faCircleExclamation,
  faFire, faStar, faHeartbeat, faBaby, faChild,
  faRing, faHeartBroken, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

// Animations artistiques
const fadeInUp = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 }
}

const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
}

const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0.5 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 180, scale: 0.5 }
}

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const RHCongesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sortField, setSortField] = useState<string>('date_debut')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [newCongeInfo, setNewCongeInfo] = useState<any>(null)

  const [formData, setFormData] = useState({
    matricule: '',
    type_conge: 'Annuel',
    date_debut: '',
    date_fin: '',
    nombre_jours: '',
    motif: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = useCallback(() => {
    setLoading(true)
    loadDashboardRHContext()
      .then((data) => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const rawConges = useMemo(() => dashboardData?.conges || [], [dashboardData])

  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const getEmployeName = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }, [employes])

  const getEmployeEmail = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp?.email || 'N/A'
  }, [employes])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedConges = useMemo(() => {
    let filtered = rawConges.filter((c: any) => {
      const empName = getEmployeName(c.matricule).toLowerCase()
      const typeConge = (c.type_conge || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || typeConge.includes(searchLower) || (c.matricule || '').toLowerCase().includes(searchLower)
      const matchesType = filterType === 'all' || c.type_conge === filterType
      const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
      return matchesSearch && matchesType && matchesStatut
    })

    filtered.sort((a: any, b: any) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      
      if (sortField === 'date_debut' || sortField === 'date_fin') {
        valA = new Date(valA).getTime() || 0
        valB = new Date(valB).getTime() || 0
      }
      
      if (sortField === 'nombre_jours') {
        valA = parseInt(valA) || 0
        valB = parseInt(valB) || 0
      }
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [rawConges, getEmployeName, searchTerm, filterType, filterStatut, sortField, sortDirection])

  const stats = useMemo(() => ({
    total: rawConges.length,
    approuves: rawConges.filter((c: any) => c.statut === 'Approuve').length,
    enAttente: rawConges.filter((c: any) => c.statut === 'En attente').length,
    refuses: rawConges.filter((c: any) => c.statut === 'Refuse').length,
  }), [rawConges])

  const handleStatutChange = async (id: number, nouveauStatut: string) => {
    try {
      await apiRequest(`rh/conges/${id}/statut`, {
        method: 'PATCH',
        body: JSON.stringify({ statut: nouveauStatut })
      })
      loadData()
    } catch (err: any) {
      alert(err.message || "Erreur lors de la modification du statut.")
    }
  }

  const handleAddConge = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const response = await apiRequest('rh/conges', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setNewCongeInfo({
        ...formData,
        employeName: getEmployeName(formData.matricule),
        id: response?.id_conge || Date.now()
      })
      
      setShowAddModal(false)
      setShowSuccessModal(true)
      setSuccessMsg('Demande de congé créée avec succès !')

      setFormData({
        matricule: '',
        type_conge: 'Annuel',
        date_debut: '',
        date_fin: '',
        nombre_jours: '',
        motif: ''
      })
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de la demande.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setNewCongeInfo(null)
    setSuccessMsg('')
  }

  const getStatutColor = (statut: string) => {
    const colors = {
      'Approuve': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'En attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Refuse': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    }
    return colors[statut as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      'Approuve': faCheckCircle,
      'En attente': faClock,
      'Refuse': faTimesCircle,
    }
    return icons[statut as keyof typeof icons] || faShield
  }

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'Annuel': faSun,
      'Maladie': faHeartbeat,
      'Maternité': faBaby,
      'Paternité': faChild,
      'Exceptionnel': faStar,
      'Sans solde': faMoon,
      'Mariage': faRing,
      "Décès d'un proche": faHeartBroken,
    }
    return icons[type] || faCalendar
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Annuel': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Maladie': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      'Maternité': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      'Paternité': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
      'Exceptionnel': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Sans solde': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
      'Mariage': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      "Décès d'un proche": 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    }
    return colors[type] || 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
  }

  // Le badge « nouveau » reste visible 30 minutes après l'approbation.
  const isRecentlyApproved = useCallback((conge: any) => {
    if (conge.statut !== 'Approuve') return false

    const approvalDate = conge.date_approbation || conge.approved_at || conge.approuve_at || conge.updated_at
    if (!approvalDate) return false

    const approvalTime = new Date(approvalDate).getTime()
    return Number.isFinite(approvalTime) && Date.now() - approvalTime >= 0 && Date.now() - approvalTime < 30 * 60 * 1000
  }, [])

  const statsCards = useMemo(() => [
    { 
      label: 'Total Demandes', 
      value: stats.total, 
      color: 'from-violet-500 to-indigo-600', 
      icon: faCalendar,
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40'
    },
    { 
      label: 'Approuvés', 
      value: stats.approuves, 
      color: 'from-emerald-500 to-teal-600', 
      icon: faCheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40'
    },
    { 
      label: 'En Attente', 
      value: stats.enAttente, 
      color: 'from-amber-500 to-orange-600', 
      icon: faClock,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40'
    },
    { 
      label: 'Refusés', 
      value: stats.refuses, 
      color: 'from-rose-500 to-red-600', 
      icon: faTimesCircle,
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      iconBg: 'bg-rose-100 dark:bg-rose-900/40'
    },
  ], [stats])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen"
    >
      {/* Header */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            variants={floatAnimation}
            animate="animate"
            className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/30"
          >
            <FontAwesomeIcon icon={faCalendar} className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
              Gestion des Congés
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                {stats.total} demandes
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                {stats.approuves} approuvés
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-300">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                {stats.enAttente} en attente
              </span>
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)} 
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle demande</span>
        </motion.button>
      </motion.div>

      {/* Statistiques */}
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
                <motion.div 
                  className="mt-2 h-1 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? Math.min((stat.value / stats.total) * 100, 100) : 0}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                  />
                </motion.div>
              </div>
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all`}
              >
                <FontAwesomeIcon icon={stat.icon} className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
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

      {/* Filtres et recherche */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
            </motion.div>
            <input 
              type="text" 
              placeholder="Rechercher par employé, type ou matricule..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                className="pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white appearance-none"
              >
                <option value="all">Tous les types</option>
                <option value="Annuel">Annuel</option>
                <option value="Maladie">Maladie</option>
                <option value="Maternité">Maternité</option>
                <option value="Paternité">Paternité</option>
                <option value="Exceptionnel">Exceptionnel</option>
                <option value="Sans solde">Sans solde</option>
                <option value="Mariage">Mariage</option>
                <option value="Décès d'un proche">Décès d'un proche</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faShield} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={filterStatut} 
                onChange={(e) => setFilterStatut(e.target.value)} 
                className="pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Approuve">Approuvé</option>
                <option value="En attente">En attente</option>
                <option value="Refuse">Refusé</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des congés */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
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
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedConges.map((conge: any) => {
              const StatutIcon = getStatutIcon(conge.statut || 'En attente')
              const TypeIcon = getTypeIcon(conge.type_conge)
              return (
                <motion.div
                  key={conge.id_conge}
                  variants={fadeInUp}
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 group backdrop-blur-sm relative overflow-hidden"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0"
                    animate={{
                      x: ['-100%', '100%'],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                  />

                  {/* Badge nouveau */}
                  {isRecentlyApproved(conge) && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg"
                    >
                      <FontAwesomeIcon icon={faFire} className="mr-1" />
                      NOUVEAU
                    </motion.div>
                  )}

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(conge.type_conge).split(' ')[0]} shadow-lg`}
                      >
                        <FontAwesomeIcon icon={TypeIcon} className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs" />
                          {getEmployeName(conge.matricule)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{conge.type_conge}</p>
                      </div>
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatutColor(conge.statut || 'En attente')}`}
                    >
                      <FontAwesomeIcon icon={StatutIcon} className="w-3 h-3" />
                      {conge.statut || 'En attente'}
                    </motion.span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm relative z-10">
                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-slate-400" />
                      <span>{conge.date_debut} → {conge.date_fin}</span>
                    </motion.div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{conge.nombre_jours} jours</span>
                    </div>
                    {conge.motif && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-500 dark:text-slate-400 italic flex items-start gap-1.5"
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3 text-slate-400 mt-0.5" />
                        "{conge.motif}"
                      </motion.p>
                    )}
                  </div>

                  {conge.statut === 'En attente' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-2 relative z-10"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatutChange(conge.id_conge, 'Approuve')} 
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        <span>Approuver</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatutChange(conge.id_conge, 'Refuse')} 
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-rose-500/30 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                        <span>Refuser</span>
                      </motion.button>
                    </motion.div>
                  )}

                  <motion.div 
                    className="mt-3 h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      className={`h-full bg-gradient-to-r ${
                        conge.statut === 'Approuve' ? 'from-emerald-500 to-teal-500' :
                        conge.statut === 'Refuse' ? 'from-rose-500 to-red-500' :
                        'from-amber-500 to-orange-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: conge.statut === 'Approuve' ? '100%' : conge.statut === 'Refuse' ? '30%' : '60%' }}
                      transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* MODAL DE SUCCÈS */}
      <AnimatePresence>
        {showSuccessModal && newCongeInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={closeSuccessModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5 border border-emerald-300/50 dark:border-emerald-800/50 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="flex items-start gap-3 relative z-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/40"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white text-2xl" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                    ✅ Demande créée avec succès !
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {successMsg || 'La demande de congé a été enregistrée.'}
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeSuccessModal} 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faX} className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-3 text-sm border border-slate-200 dark:border-slate-700 relative z-10">
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{newCongeInfo.employeName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Type:</span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{newCongeInfo.type_conge}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Début</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{newCongeInfo.date_debut || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Fin</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{newCongeInfo.date_fin || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Jours</span>
                    <p className="font-semibold text-primary-600 dark:text-primary-400">{newCongeInfo.nombre_jours} jours</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Statut</span>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      En attente
                    </p>
                  </div>
                </div>

                {newCongeInfo.motif && (
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Motif</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{newCongeInfo.motif}"</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={closeSuccessModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                <span>Terminé</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT CONGÉ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => {
              if (!submitting) setShowAddModal(false)
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 backdrop-blur-xl bg-opacity-90">
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-white text-lg" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Nouvelle demande de congé
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!submitting) setShowAddModal(false)
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faX} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>

              <form onSubmit={handleAddConge} className="p-6 space-y-4">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl text-sm border border-rose-200 dark:border-rose-800 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4" />
                    {errorMsg}
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                    Employé *
                  </label>
                  <select 
                    required 
                    value={formData.matricule} 
                    onChange={(e) => setFormData({...formData, matricule: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employes.map((emp: any) => (
                      <option key={emp.matricule} value={emp.matricule}>
                        {emp.prenom} {emp.nom} ({emp.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                    Type de congé *
                  </label>
                  <select 
                    value={formData.type_conge} 
                    onChange={(e) => setFormData({...formData, type_conge: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                  >
                    <option value="Annuel">Annuel</option>
                    <option value="Maladie">Maladie</option>
                    <option value="Maternité">Maternité</option>
                    <option value="Paternité">Paternité</option>
                    <option value="Exceptionnel">Exceptionnel</option>
                    <option value="Sans solde">Sans solde</option>
                    <option value="Mariage">Mariage</option>
                    <option value="Décès d'un proche">Décès d'un proche</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                      Date début *
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date_debut} 
                      onChange={(e) => setFormData({...formData, date_debut: e.target.value})} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                      Date fin *
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date_fin} 
                      onChange={(e) => setFormData({...formData, date_fin: e.target.value})} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                    Nombre de jours *
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={formData.nombre_jours} 
                    onChange={(e) => setFormData({...formData, nombre_jours: e.target.value})} 
                    placeholder="5" 
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3" />
                    Motif
                  </label>
                  <textarea 
                    rows={3} 
                    value={formData.motif} 
                    onChange={(e) => setFormData({...formData, motif: e.target.value})} 
                    placeholder="Raison de la demande..." 
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => {
                      if (!submitting) setShowAddModal(false)
                    }} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={submitting} 
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                        Enregistrer
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles CSS supplémentaires */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
      `}</style>
    </motion.div>
  )
}