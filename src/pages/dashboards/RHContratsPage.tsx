import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileContract, faSearch, faPlus, faEye, faEdit, faTrash,
  faDownload, faDollarSign, faUser, faTimes, faShield,
  faCheckCircle, faCircleCheck, faCircleExclamation, faSpinner,
  faSort, faSortUp, faSortDown, faFilter, faHashtag, faFileAlt,
  faBriefcase, faCalendarAlt, faHourglassHalf, faEnvelope
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

const flipIn = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: -90 }
}

export const RHContratsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedContrat, setSelectedContrat] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<string>('date_debut')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [newContratInfo, setNewContratInfo] = useState<any>(null)

  const [formData, setFormData] = useState({
    matricule: '',
    type: 'CDI',
    date_debut: '',
    date_fin: '',
    salaire_base: '',
    details: '',
    statut: 'Actif'
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
  const postes = useMemo(() => dashboardData?.postes || [], [dashboardData])
  const rawContrats = useMemo(() => dashboardData?.contrats || [], [dashboardData])

  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const contrats = useMemo(() => {
    if (!rawContrats.length) return []
    return rawContrats.map((c: any) => ({
      ...c,
      reference: c.contrat || c.reference || `CTR-${c.id_contrat}`,
      type_contrat: c.type || c.type_contrat || 'CDI'
    }))
  }, [rawContrats])

  const filteredAndSortedContrats = useMemo(() => {
    let filtered = contrats.filter((c: any) => {
      const emp = employes.find((e: any) => String(e.matricule) === String(c.matricule))
      const searchLower = searchTerm.toLowerCase()
      
      const matchesSearch = 
        (c.reference?.toLowerCase() || '').includes(searchLower) || 
        (emp?.nom?.toLowerCase() || '').includes(searchLower) ||
        (emp?.prenom?.toLowerCase() || '').includes(searchLower) ||
        (c.matricule?.toLowerCase() || '').includes(searchLower)

      const matchesType = filterType === 'all' || c.type_contrat === filterType
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
      
      if (sortField === 'salaire_base') {
        valA = parseFloat(valA) || 0
        valB = parseFloat(valB) || 0
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
  }, [contrats, employes, searchTerm, filterType, filterStatut, sortField, sortDirection])

  const getEmployeName = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }, [employes])

  const getEmployeEmail = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp?.email || 'N/A'
  }, [employes])

  const getPosteTitle = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    if (!emp) return 'N/A'
    const poste = postes.find((p: any) => Number(p.id_poste ?? p.id) === Number(emp.id_poste))
    return poste?.titre_poste || poste?.nom || 'N/A'
  }, [employes, postes])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleAddContrat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const response = await apiRequest('rh/contrats', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setNewContratInfo({
        ...formData,
        reference: response?.reference || `CTR-${Date.now()}`,
        employeName: getEmployeName(formData.matricule)
      })
      
      setShowAddModal(false)
      setShowSuccessModal(true)
      setSuccessMsg('Contrat créé avec succès !')

      setFormData({
        matricule: '',
        type: 'CDI',
        date_debut: '',
        date_fin: '',
        salaire_base: '',
        details: '',
        statut: 'Actif'
      })
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du contrat.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setNewContratInfo(null)
    setSuccessMsg('')
  }

  const getStatutColor = (statut: string) => {
    const colors = {
      'Actif': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'Expire': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      'En_attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    }
    return colors[statut as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      'Actif': faCheckCircle,
      'Expire': faTimes,
      'En_attente': faHourglassHalf,
    }
    return icons[statut as keyof typeof icons] || faShield
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'CDI': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'CDD': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Stage': 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    }
    return colors[type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }

  const stats = useMemo(() => ({
    total: contrats.length,
    actifs: contrats.filter((c: any) => c.statut === 'Actif').length,
    cdi: contrats.filter((c: any) => c.type_contrat === 'CDI').length,
    cdd: contrats.filter((c: any) => c.type_contrat === 'CDD').length,
  }), [contrats])

  const statsCards = useMemo(() => [
    { 
      label: 'Total Contrats', 
      value: stats.total, 
      color: 'from-violet-500 to-indigo-600', 
      icon: faFileContract,
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40'
    },
    { 
      label: 'Contrats Actifs', 
      value: stats.actifs, 
      color: 'from-emerald-500 to-teal-600', 
      icon: faShield,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40'
    },
    { 
      label: 'CDI', 
      value: stats.cdi, 
      color: 'from-blue-500 to-cyan-600', 
      icon: faFileContract,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40'
    },
    { 
      label: 'CDD', 
      value: stats.cdd, 
      color: 'from-amber-500 to-orange-600', 
      icon: faHourglassHalf,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40'
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
            <FontAwesomeIcon icon={faFileContract} className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
              Gestion des Contrats
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                <FontAwesomeIcon icon={faFileContract} className="text-xs" />
                {stats.total} contrats
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                <FontAwesomeIcon icon={faShield} className="text-xs" />
                {stats.actifs} actifs
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-300">
                <FontAwesomeIcon icon={faFileContract} className="text-xs" />
                {stats.cdi} CDI
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm border border-slate-200 dark:border-slate-600 shadow-sm"
          >
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all text-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau contrat</span>
          </motion.button>
        </div>
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
              placeholder="Rechercher par référence, employé ou matricule..." 
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
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
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
                <option value="Actif">Actif</option>
                <option value="Expire">Expiré</option>
                <option value="En_attente">En attente</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des contrats */}
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
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden backdrop-blur-xl"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('reference')}
                  >
                    <div className="flex items-center gap-1.5">
                      Référence
                      <FontAwesomeIcon icon={sortField === 'reference' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('matricule')}
                  >
                    <div className="flex items-center gap-1.5">
                      Employé
                      <FontAwesomeIcon icon={sortField === 'matricule' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Poste</th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('type_contrat')}
                  >
                    <div className="flex items-center gap-1.5">
                      Type
                      <FontAwesomeIcon icon={sortField === 'type_contrat' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('salaire_base')}
                  >
                    <div className="flex items-center gap-1.5">
                      Salaire
                      <FontAwesomeIcon icon={sortField === 'salaire_base' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('date_debut')}
                  >
                    <div className="flex items-center gap-1.5">
                      Début
                      <FontAwesomeIcon icon={sortField === 'date_debut' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('date_fin')}
                  >
                    <div className="flex items-center gap-1.5">
                      Fin
                      <FontAwesomeIcon icon={sortField === 'date_fin' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('statut')}
                  >
                    <div className="flex items-center gap-1.5">
                      Statut
                      <FontAwesomeIcon icon={sortField === 'statut' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedContrats.map((contrat: any) => {
                    const StatutIcon = getStatutIcon(contrat.statut || 'En_attente')
                    return (
                      <motion.tr 
                        key={contrat.id_contrat}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                        onClick={() => setSelectedContrat(contrat)}
                        className="border-b border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-300 group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20"
                            >
                              <FontAwesomeIcon icon={faFileContract} className="text-white text-sm" />
                            </motion.div>
                            <span className="font-mono text-sm font-semibold text-slate-800 dark:text-white">{contrat.reference}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs" />
                            {getEmployeName(contrat.matricule)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(contrat.matricule)}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faBriefcase} className="text-slate-400 text-xs" />
                            {getPosteTitle(contrat.matricule)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeColor(contrat.type_contrat)} inline-flex items-center gap-1.5`}>
                            <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3" />
                            {contrat.type_contrat}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white hidden lg:table-cell">
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ${contrat.salaire_base || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-xs" />
                            {contrat.date_debut || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-xs" />
                            {contrat.date_fin || 'Indéterminée'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getStatutColor(contrat.statut || 'En_attente')}`}
                          >
                            <FontAwesomeIcon icon={StatutIcon} className="w-3 h-3" />
                            {contrat.statut || 'En attente'}
                          </motion.span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                            <motion.button 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedContrat(contrat)}
                              className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* MODAL DE SUCCÈS */}
      <AnimatePresence>
        {showSuccessModal && newContratInfo && (
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
                  <FontAwesomeIcon icon={faCircleCheck} className="text-white text-2xl" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                    ✅ Contrat créé avec succès !
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {successMsg || 'Le contrat a été enregistré avec succès.'}
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeSuccessModal} 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-3 text-sm border border-slate-200 dark:border-slate-700 relative z-10">
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faFileContract} className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{newContratInfo.employeName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Référence:</span>
                      <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{newContratInfo.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Type</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{newContratInfo.type}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Salaire</span>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">${newContratInfo.salaire_base}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Début</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{newContratInfo.date_debut || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs text-slate-500">Fin</span>
                    <p className="font-semibold text-slate-800 dark:text-white">{newContratInfo.date_fin || 'Indéterminée'}</p>
                  </div>
                </div>

                <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xs text-slate-500">Statut</span>
                  <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                    {newContratInfo.statut || 'Actif'}
                  </p>
                </div>
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

      {/* MODAL DÉTAILS */}
      <AnimatePresence>
        {selectedContrat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => setSelectedContrat(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                    <FontAwesomeIcon icon={faFileContract} className="text-white text-lg" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Détails du contrat
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedContrat(null)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50/80 to-indigo-50/80 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring" }}
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30"
                  >
                    <FontAwesomeIcon icon={faFileContract} className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Référence</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{selectedContrat.reference}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatutColor(selectedContrat.statut || 'En_attente')}`}>
                      <FontAwesomeIcon icon={getStatutIcon(selectedContrat.statut || 'En_attente')} className="w-3 h-3" />
                      {selectedContrat.statut || 'En attente'}
                    </span>
                  </div>
                </div>

                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {[
                    { icon: faUser, label: 'Employé', value: getEmployeName(selectedContrat.matricule) },
                    { icon: faEnvelope, label: 'Email', value: getEmployeEmail(selectedContrat.matricule) },
                    { icon: faBriefcase, label: 'Poste', value: getPosteTitle(selectedContrat.matricule) },
                    { icon: faFileAlt, label: 'Type de contrat', value: selectedContrat.type_contrat },
                    { icon: faDollarSign, label: 'Salaire de base', value: '$' + (selectedContrat.salaire_base || 0) },
                    { icon: faCalendarAlt, label: 'Date de début', value: selectedContrat.date_debut || 'N/A' },
                    { icon: faCalendarAlt, label: 'Date de fin', value: selectedContrat.date_fin || 'Indéterminée' },
                    { icon: faHashtag, label: 'Matricule', value: selectedContrat.matricule },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      variants={slideInFromLeft}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 text-primary-500" />
                        {item.label}
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5 text-primary-500" />
                    Détails / Clauses
                  </p>
                  <p className="text-slate-800 dark:text-white text-sm whitespace-pre-wrap">
                    {selectedContrat.details || 'Aucun détail supplémentaire spécifié.'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT CONTRAT */}
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
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                    Créer un nouveau contrat
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
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>

              <form onSubmit={handleAddContrat} className="p-6 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
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
                          {emp.prenom} {emp.nom} ({emp.matricule}) - {emp.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3" />
                      Type de contrat *
                    </label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                      Salaire de base ($) *
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={formData.salaire_base} 
                      onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} 
                      placeholder="1500" 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                      Date de début *
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
                      Date de fin (Optionnel)
                    </label>
                    <input 
                      type="date" 
                      value={formData.date_fin} 
                      onChange={(e) => setFormData({...formData, date_fin: e.target.value})} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3" />
                      Détails / Clauses
                    </label>
                    <textarea 
                      rows={3} 
                      value={formData.details} 
                      onChange={(e) => setFormData({...formData, details: e.target.value})} 
                      placeholder="Clauses particulières, conditions de travail..." 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
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
                        Créer le contrat
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