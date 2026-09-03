import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUsers, faSearch, faEnvelope, faPhone, faMapMarkerAlt, 
  faCalendar, faBriefcase, faEye, faDownload, faUserPlus, 
  faTh, faList, faEdit, faTrash, faTimes, faCopy, faCheck,
  faCheckCircle, faLink, faSpinner, faShield, faClock,
  faUserCheck, faBuilding, faHashtag, faAt,
  faMale, faFemale, faChartLine, faCalendarAlt,
  faSort, faSortDown, faSortUp, faFilter, faFire,
  faCircleExclamation, faKey
} from '@fortawesome/free-solid-svg-icons'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

type CredentialsModalState = {
  status: 'success' | 'warning'
  email: string
  password: string
  matricule: string
  nomComplet: string
  loginUrl: string
  message?: string
}

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

export const RHEmployesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<string>('date_embauche')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [newCredentials, setNewCredentials] = useState<CredentialsModalState | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: 'M',
    salaire_base: '',
    id_poste: '',
    company_id: '',
    adresse: '',
    date_naissance: '',
    lieu_naissance: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const closeAddModal = () => setShowAddModal(false)

  const loadData = useCallback(() => {
    setLoading(true)
    loadDashboardRHContext()
      .then((data) => {
        setDashboardData(data)
        if (data?.entreprise?.id_entreprise) {
          setFormData(prev => ({ ...prev, company_id: data.entreprise.id_entreprise }))
        }
      })
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const postes = useMemo(() => dashboardData?.postes || [], [dashboardData])
  const services = useMemo(() => dashboardData?.services || [], [dashboardData])
  const contrats = useMemo(() => dashboardData?.contrats || [], [dashboardData])

  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = employes.filter((emp: any) => {
      const matchesSearch = 
        (emp.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (emp.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (emp.matricule?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      const matchesStatut = filterStatut === 'all' || emp.statut === filterStatut
      return matchesSearch && matchesStatut
    })

    filtered.sort((a: any, b: any) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      
      if (sortField === 'date_embauche') {
        valA = new Date(valA).getTime() || 0
        valB = new Date(valB).getTime() || 0
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
  }, [employes, searchTerm, filterStatut, sortField, sortDirection])

  const getPosteTitle = useCallback((idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    return poste?.titre_poste || 'N/A'
  }, [postes])

  const getServiceName = useCallback((idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    if (!poste) return 'N/A'
    const service = services.find((s: any) => Number(s.id_service) === Number(poste.id_service))
    return service?.nom || 'N/A'
  }, [postes, services])

  const getContratInfo = useCallback((matricule: string) => {
    return contrats.find((c: any) => c.matricule === matricule)
  }, [contrats])

  const getResponseValue = (source: any, keys: string[]) => {
    for (const key of keys) {
      if (source && source[key]) return source[key]
      if (source?.data && source.data[key]) return source.data[key]
      if (source?.employe && source.employe[key]) return source.employe[key]
      if (source?.membre && source.membre[key]) return source.membre[key]
      if (source?.credentials && source.credentials[key]) return source.credentials[key]
      if (source?.mail && source.mail[key]) return source.mail[key]
    }
    return undefined
  }

  const buildCredentialsFromSource = (source: any, status: 'success' | 'warning'): CredentialsModalState => {
    const currentYear = new Date().getFullYear()
    const fallbackPassword = formData.nom
      ? `${formData.nom.charAt(0).toUpperCase()}${formData.nom.slice(1).toLowerCase()}@${currentYear}`
      : 'Non communiqué'

    const credentialsSource = source?.credentials || source?.data?.credentials || source?.employe || source?.membre || source

    return {
      status,
      email: String(getResponseValue(credentialsSource, ['email']) || formData.email || '-'),
      password: String(getResponseValue(credentialsSource, ['password', 'temp_password', 'temporary_password']) || fallbackPassword),
      matricule: String(getResponseValue(credentialsSource, ['matricule']) || `EMP-${currentYear}-XXXXX`),
      nomComplet: `${String(getResponseValue(credentialsSource, ['prenom']) || formData.prenom || '').trim()} ${String(getResponseValue(credentialsSource, ['nom']) || formData.nom || '').trim()}`.trim(),
      loginUrl: String(getResponseValue(credentialsSource, ['login_url', 'loginUrl']) || ''),
      message: String(source?.message || source?.data?.message || ''),
    }
  }

  const refreshDashboardData = useCallback(() => {
    loadDashboardRHContext()
      .then((data) => {
        setDashboardData(data)
        if (data?.entreprise?.id_entreprise) {
          setFormData(prev => ({ ...prev, company_id: data.entreprise.id_entreprise }))
        }
      })
      .catch(() => {})
  }, [])

  const handleAddEmploye = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg(null)

    // Validation minimale
    if (!formData.company_id) {
      setErrorMsg("L'ID de l'entreprise est manquant. Veuillez actualiser la page.")
      setSubmitting(false)
      return
    }

    try {
      const response: any = await apiRequest('/rh/employes', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response?.success !== true) {
        throw new Error(response?.message || "Erreur lors de l'enregistrement de l'employé.")
      }

      // Construire les credentials à partir de la réponse
      const credentials = buildCredentialsFromSource(response, 'success')
      setNewCredentials(credentials)
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        post_nom: '',
        prenom: '',
        email: '',
        telephone: '',
        sexe: 'M',
        salaire_base: '',
        id_poste: '',
        company_id: dashboardData?.entreprise?.id_entreprise || '',
        adresse: '',
        date_naissance: '',
        lieu_naissance: ''
      })

      // Fermer le modal d'ajout et ouvrir le modal de succès
      setShowAddModal(false)
      setShowSuccessModal(true)
      setSuccessMsg(response?.message || 'Employé créé avec succès.')

      refreshDashboardData()
    } catch (err: any) {
      setErrorMsg(err?.payload?.message || err?.response?.data?.message || err?.message || "Erreur lors de l'enregistrement de l'employé.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setNewCredentials(null)
    setSuccessMsg(null)
  }

  const copyToClipboard = async (text: string, fieldKey: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldKey)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      setErrorMsg('Impossible de copier dans le presse-papiers.')
    }
  }

  const buildCredentialsSummary = (credentials: CredentialsModalState) => {
    return [
      `Nom: ${credentials.nomComplet}`,
      `Email: ${credentials.email}`,
      `Matricule: ${credentials.matricule}`,
      `Mot de passe temporaire: ${credentials.password}`,
      `Lien de connexion: ${credentials.loginUrl || 'Non communiqué'}`,
    ].join('\n')
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatutColor = (statut: string) => {
    const colors = {
      'Actif': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'Inactif': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      'En conge': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    }
    return colors[statut as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      'Actif': faCheckCircle,
      'Inactif': faTimes,
      'En conge': faClock,
    }
    return icons[statut as keyof typeof icons] || faUsers
  }

  const getSexeIcon = (sexe: string) => {
    return sexe === 'M' ? faMale : faFemale
  }

  const statsCards = useMemo(() => [
    { 
      label: 'Total Employés', 
      value: employes.length, 
      color: 'from-violet-500 to-indigo-600', 
      icon: faUsers,
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      ring: 'ring-violet-500/20'
    },
    { 
      label: 'Hommes', 
      value: employes.filter((e: any) => e.sexe === 'M').length, 
      color: 'from-blue-500 to-cyan-600', 
      icon: faMale,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      ring: 'ring-blue-500/20'
    },
    { 
      label: 'Femmes', 
      value: employes.filter((e: any) => e.sexe === 'F').length, 
      color: 'from-pink-500 to-rose-600', 
      icon: faFemale,
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      iconBg: 'bg-pink-100 dark:bg-pink-900/40',
      ring: 'ring-pink-500/20'
    },
    { 
      label: 'Actifs', 
      value: employes.filter((e: any) => e.statut === 'Actif').length, 
      color: 'from-emerald-500 to-teal-600', 
      icon: faShield,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      ring: 'ring-emerald-500/20'
    },
  ], [employes])

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
            <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
              Gestion des Employés
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                <FontAwesomeIcon icon={faUsers} className="text-xs" />
                {employes.length} employés
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                <FontAwesomeIcon icon={faShield} className="text-xs" />
                {employes.filter((e: any) => e.statut === 'Actif').length} actifs
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-300">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                {employes.filter((e: any) => e.statut === 'En conge').length} en congé
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
            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
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
                    animate={{ width: `${(stat.value / employes.length) * 100}%` }}
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
              placeholder="Rechercher par nom, email ou matricule..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={filterStatut} 
                onChange={(e) => setFilterStatut(e.target.value)} 
                className="pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En conge">En congé</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')} 
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-md shadow-black/5' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
              >
                <FontAwesomeIcon icon={faTh} className={`w-4 h-4 ${viewMode === 'grid' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')} 
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-md shadow-black/5' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
              >
                <FontAwesomeIcon icon={faList} className={`w-4 h-4 ${viewMode === 'list' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des employés */}
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
      ) : viewMode === 'grid' ? (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedMembers.map((emp: any) => {
              const contrat = getContratInfo(emp.matricule)
              const StatutIcon = getStatutIcon(emp.statut || 'Actif')
              const SexeIcon = getSexeIcon(emp.sexe)
              return (
                <motion.div
                  key={emp.matricule}
                  variants={fadeInUp}
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onClick={() => setSelectedMember(emp)}
                  className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 cursor-pointer group backdrop-blur-sm relative overflow-hidden"
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
                  
                  {new Date(emp.date_embauche).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
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

                  <div className="flex items-start space-x-4 mb-4 relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                        emp.sexe === 'M' 
                          ? 'from-violet-500 to-indigo-600 shadow-violet-500/30' 
                          : 'from-pink-500 to-rose-600 shadow-pink-500/30'
                      } shadow-lg flex-shrink-0`}
                    >
                      <FontAwesomeIcon icon={SexeIcon} className="text-white text-xl" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white truncate text-lg">
                        {emp.prenom} {emp.nom}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBriefcase} className="w-3 h-3 flex-shrink-0" />
                        {getPosteTitle(emp.id_poste)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBuilding} className="w-3 h-3 flex-shrink-0" />
                        {getServiceName(emp.id_poste)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs sm:text-sm relative z-10">
                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </motion.div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4 flex-shrink-0" />
                      <span>{emp.telephone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 flex-shrink-0" />
                      <span className="font-mono text-xs">{emp.matricule}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">{emp.date_embauche}</span>
                    </div>
                  </div>

                  <motion.div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between relative z-10">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatutColor(emp.statut || 'Actif')}`}
                    >
                      <FontAwesomeIcon icon={StatutIcon} className="w-3 h-3" />
                      {emp.statut || 'Actif'}
                    </motion.span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.button 
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="mt-3 h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary-500 via-violet-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 60 + 20}%` }}
                      transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
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
                    onClick={() => handleSort('prenom')}
                  >
                    <div className="flex items-center gap-1.5">
                      Employé
                      <FontAwesomeIcon icon={sortField === 'prenom' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('matricule')}
                  >
                    <div className="flex items-center gap-1.5">
                      Matricule
                      <FontAwesomeIcon icon={sortField === 'matricule' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('id_poste')}
                  >
                    <div className="flex items-center gap-1.5">
                      Poste
                      <FontAwesomeIcon icon={sortField === 'id_poste' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Service</th>
                  <th 
                    className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden xl:table-cell cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSort('salaire_base')}
                  >
                    <div className="flex items-center gap-1.5">
                      Salaire
                      <FontAwesomeIcon icon={sortField === 'salaire_base' ? (sortDirection === 'asc' ? faSortUp : faSortDown) : faSort} className="text-xs" />
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
                  {filteredAndSortedMembers.map((emp: any) => {
                    const contrat = getContratInfo(emp.matricule)
                    const StatutIcon = getStatutIcon(emp.statut || 'Actif')
                    const SexeIcon = getSexeIcon(emp.sexe)
                    return (
                      <motion.tr 
                        key={emp.matricule}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                        onClick={() => setSelectedMember(emp)}
                        className="border-b border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-300 group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                                emp.sexe === 'M' 
                                  ? 'from-violet-500 to-indigo-600' 
                                  : 'from-pink-500 to-rose-600'
                              } shadow-md`}
                            >
                              <FontAwesomeIcon icon={SexeIcon} className="text-white text-sm" />
                            </motion.div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell font-mono">{emp.matricule}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{getPosteTitle(emp.id_poste)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{getServiceName(emp.id_poste)}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white hidden xl:table-cell">
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ${contrat?.salaire_base || emp.salaire_base || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getStatutColor(emp.statut || 'Actif')}`}
                          >
                            <FontAwesomeIcon icon={StatutIcon} className="w-3 h-3" />
                            {emp.statut || 'Actif'}
                          </motion.span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            <motion.button 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.9 }}
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

      {/* MODAL DE SUCCÈS AVEC IDENTIFIANTS */}
      <AnimatePresence>
        {showSuccessModal && newCredentials && (
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
              className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5 border ${newCredentials.status === 'warning' ? 'border-amber-300/50 dark:border-amber-700/50' : 'border-emerald-300/50 dark:border-emerald-800/50'} relative overflow-hidden max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Effet de fond artistique */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-violet-500/5"
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
              
              {/* En-tête avec animation */}
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
                    ✅ Employé créé avec succès !
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {successMsg || 'Les identifiants de connexion sont prêts.'}
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

              {/* Informations de l'employé */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-3 text-sm border border-slate-200 dark:border-slate-700 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faUserCheck} className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{newCredentials.nomComplet}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Matricule:</span>
                      <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{newCredentials.matricule}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 group hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faAt} className="text-primary-500" />
                      Email (identifiant)
                    </span>
                    <span className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">{newCredentials.email}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(newCredentials.email, 'email')} 
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0 group"
                  >
                    <FontAwesomeIcon 
                      icon={copiedField === 'email' ? faCheck : faCopy} 
                      className={`w-4 h-4 ${copiedField === 'email' ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} 
                    />
                  </motion.button>
                </motion.div>

                {/* Mot de passe */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 group hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faKey} className="text-amber-500" />
                      Mot de passe temporaire
                    </span>
                    <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400 break-all">{newCredentials.password}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(newCredentials.password, 'password')} 
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0 group"
                  >
                    <FontAwesomeIcon 
                      icon={copiedField === 'password' ? faCheck : faCopy} 
                      className={`w-4 h-4 ${copiedField === 'password' ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} 
                    />
                  </motion.button>
                </motion.div>

                {/* Lien de connexion */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faLink} className="text-primary-500" />
                        Lien de connexion
                      </span>
                      {newCredentials.loginUrl ? (
                        <a 
                          href={newCredentials.loginUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline break-all hover:text-primary-700 transition-colors"
                        >
                          {newCredentials.loginUrl}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">Aucun lien retourné (utilisez l'URL de votre frontend)</span>
                      )}
                    </div>
                    {newCredentials.loginUrl && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(newCredentials.loginUrl, 'loginUrl')} 
                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
                      >
                        <FontAwesomeIcon 
                          icon={copiedField === 'loginUrl' ? faCheck : faCopy} 
                          className={`w-4 h-4 ${copiedField === 'loginUrl' ? 'text-emerald-500' : 'text-slate-500'}`} 
                        />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Message sur la file d'attente des emails */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                  L'email de connexion a été mis en file d'attente et sera envoyé automatiquement dans quelques minutes (selon le Cron configuré). Vous pouvez copier les accès ci-dessous en attendant.
                </motion.div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => copyToClipboard(buildCredentialsSummary(newCredentials), 'all')}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <FontAwesomeIcon icon={copiedField === 'all' ? faCheck : faCopy} className="w-4 h-4" />
                  <span>Copier tous</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={closeSuccessModal}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                  <span>Terminer</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PROFIL */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => setSelectedMember(null)}
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
                    <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Profil de l'employé
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedMember(null)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* En-tête du profil */}
                <div className="flex items-center space-x-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring" }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                      selectedMember.sexe === 'M' 
                        ? 'from-violet-500 to-indigo-600 shadow-violet-500/30' 
                        : 'from-pink-500 to-rose-600 shadow-pink-500/30'
                    } shadow-2xl flex-shrink-0`}
                  >
                    <FontAwesomeIcon icon={getSexeIcon(selectedMember.sexe)} className="text-white text-3xl" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.prenom} {selectedMember.nom}</h4>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" />
                      {getPosteTitle(selectedMember.id_poste)}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5" />
                      {getServiceName(selectedMember.id_poste)}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatutColor(selectedMember.statut || 'Actif')}`}>
                        <FontAwesomeIcon icon={getStatutIcon(selectedMember.statut || 'Actif')} className="w-3 h-3" />
                        {selectedMember.statut || 'Actif'}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                        {selectedMember.matricule}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                        {selectedMember.date_embauche}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {[
                    { icon: faEnvelope, label: 'Email', value: selectedMember.email },
                    { icon: faPhone, label: 'Téléphone', value: selectedMember.telephone },
                    { icon: faMapMarkerAlt, label: 'Adresse', value: selectedMember.adresse },
                    { icon: faCalendar, label: "Date d'embauche", value: selectedMember.date_embauche },
                    { icon: getSexeIcon(selectedMember.sexe), label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Féminin' },
                    { icon: faCalendarAlt, label: 'Date de naissance', value: selectedMember.date_naissance },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      variants={slideInFromLeft}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 text-primary-500" />
                        {item.label}
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                        {item.value || 'N/A'}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Contrat */}
                {getContratInfo(selectedMember.matricule) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-r from-primary-50/80 via-indigo-50/80 to-violet-50/80 dark:from-primary-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 border border-primary-200 dark:border-primary-800 rounded-xl shadow-lg shadow-primary-500/5"
                  >
                    <h5 className="font-bold text-primary-800 dark:text-primary-200 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" />
                      Informations du contrat
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">Type :</span>
                        <span className="font-semibold text-slate-800 dark:text-white ml-1.5">
                          {getContratInfo(selectedMember.matricule)?.type}
                        </span>
                      </div>
                      <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">Salaire :</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1.5">
                          ${getContratInfo(selectedMember.matricule)?.salaire_base}
                        </span>
                      </div>
                      <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">Début :</span>
                        <span className="font-semibold text-slate-800 dark:text-white ml-1.5">
                          {getContratInfo(selectedMember.matricule)?.date_debut}
                        </span>
                      </div>
                      <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">Fin :</span>
                        <span className="font-semibold text-slate-800 dark:text-white ml-1.5">
                          {getContratInfo(selectedMember.matricule)?.date_fin || 'Indéterminée'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => {
              if (!submitting) closeAddModal()
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
                    <FontAwesomeIcon icon={faUserPlus} className="text-white text-lg" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Ajouter un employé
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!submitting) closeAddModal()
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>

              <form onSubmit={handleAddEmploye} className="p-6 space-y-4">
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserPlus} className="w-3 h-3" />
                      Prénom *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={formData.prenom} 
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                      placeholder="Jean" 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                      Nom *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={formData.nom} 
                      onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                      placeholder="Dupont" 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                      Email *
                    </label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      placeholder="jean.dupont@mail.com" 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                      Téléphone *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={formData.telephone} 
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                      placeholder="+243..." 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserPlus} className="w-3 h-3" />
                      Sexe *
                    </label>
                    <select 
                      value={formData.sexe} 
                      onChange={(e) => setFormData({...formData, sexe: e.target.value})} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" />
                      Salaire de base *
                    </label>
                    <input 
                      type="number" 
                      required 
                      value={formData.salaire_base} 
                      onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} 
                      placeholder="1000" 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faBriefcase} className="w-3 h-3" />
                      Poste de travail *
                    </label>
                    <select 
                      required 
                      value={formData.id_poste} 
                      onChange={(e) => setFormData(prev => ({ ...prev, id_poste: e.target.value }))} 
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-white"
                    >
                      <option value="">Sélectionner un poste</option>
                      {postes.map((p: any) => {
                        const posteId = p.id_poste ?? p.id;
                        const posteTitre = p.titre_poste || p.nom || 'Poste sans nom';
                        return (
                          <option key={posteId} value={String(posteId)}>
                            {posteTitre}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => {
                      if (!submitting) closeAddModal()
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
                        <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
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

      {/* Styles CSS supplémentaires pour animations */}
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