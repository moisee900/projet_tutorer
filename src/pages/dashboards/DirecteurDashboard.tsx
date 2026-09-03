import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Building2, Users, Briefcase, Calendar,
  DollarSign, LogOut, Menu, X, Moon, Sun, Search, Bell,
  Target, UserCheck, Settings, FileText, BookOpen, Award, 
  MessageSquare, TrendingUp, CheckSquare, BarChart3,
  FileSignature, Plug, Headphones, Archive, Shield, Flag,
  Send, Lock, Building, Clock, CheckCircle2, Heart,
  Heart as HeartIcon, BookOpen as BookIcon, Users as UsersIcon, 
  Clock as ClockIcon, RefreshCw, Sparkles, Crown, ArrowRight,
  Home, MoreHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { RHProLogo } from '../../components/brand/RHProLogo'
import { notificationAPI } from '../../services/api'
import { loadDashboardContext } from '../../services/dashboardData'

// Importation des pages...
import { DirecteurEntreprisePage } from './DirecteurEntreprisePage'
import { DirecteurMembresPage } from './DirecteurMembresPage'
import { DirecteurServicesPage } from './DirecteurServicesPage'
import { DirecteurStatistiquesPage } from './DirecteurStatistiquesPage'
import { DirecteurNotificationsPage } from './DirecteurNotificationsPage'
import { DirecteurParametresPage } from './DirecteurParametresPage'
import { DirecteurPostesPage } from './DirecteurPostesPage'
import { DirecteurCandidatsPage } from './DirecteurCandidatsPage'
import { DirecteurOffresPage } from './DirecteurOffresPage'
import { DirecteurEvaluationsPage } from './DirecteurEvaluationsPage'
import { DirecteurFormationsPage } from './DirecteurFormationsPage'
import { DirecteurOrganigrammePage } from './DirecteurOrganigrammePage'
import { DirecteurPaieAvanceePage } from './DirecteurPaieAvanceePage'
import { DirecteurOnboardingPage } from './DirecteurOnboardingPage'
import { DirecteurCommunicationPage } from './DirecteurCommunicationPage'
import { DirecteurAnalyticsPage } from './DirecteurAnalyticsPage'
import { DirecteurSignaturePage } from './DirecteurSignaturePage'
import { DirecteurIntegrationsPage } from './DirecteurIntegrationsPage'
import { DirecteurTicketsPage } from './DirecteurTicketsPage'
import { DirecteurArchivagePage } from './DirecteurArchivagePage'
import { DirecteurAuditLogsPage } from './DirecteurAuditLogsPage'
import { DirecteurJoursFeriesPage } from './DirecteurJoursFeriesPage'
import { DirecteurMessageriePage } from './DirecteurMessageriePage'
import { DirecteurCalendrierPage } from './DirecteurCalendrierPage'
import { DirecteurPermissionsPage } from './DirecteurPermissionsPage'
import { DirecteurMesEntreprisesPage } from './DirecteurMesEntreprisesPage'
import { DirecteurPointagePage } from './DirecteurPointagePage'
import { DirecteurApprobationsPage } from './DirecteurApprobationsPage'
import { DirecteurNotesFraisPage } from './DirecteurNotesFraisPage'
import { DirecteurEquipementsPage } from './DirecteurEquipementsPage'
import { DirecteurReconnaissancesPage } from './DirecteurReconnaissancesPage'
import { DirecteurSondagesPage } from './DirecteurSondagesPage'
import { DirecteurBienEtrePage } from './DirecteurBienEtrePage'
import { DirecteurKnowledgeBasePage } from './DirecteurKnowledgeBasePage'
import { DirecteurMentoratPage } from './DirecteurMentoratPage'
import { DirecteurTimesheetPage } from './DirecteurTimesheetPage'

// Animations variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const pulseGlow = {
  scale: [1, 1.02, 1],
  opacity: [0.6, 0.8, 0.6],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

const SECTIONS_ROUTES = [
  'mesentreprises', 'entreprise', 'services', 'postes', 'offres', 'membres', 
  'candidats', 'onboarding', 'evaluations', 'formations', 'organigramme', 'paie', 
  'communication', 'messagerie', 'calendrier', 'pointage', 'approbations', 'notesfrais', 
  'equipements', 'reconnaissances', 'sondages', 'bienetre', 'kb', 'mentorat', 
  'timesheets', 'analytics', 'signature', 'integrations', 'support', 'archivage', 
  'audit', 'permissions', 'joursferies', 'stats', 'notifications', 'parametres'
]

export const DirecteurDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; date: string; read: boolean }>>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Chargement centralisé et sécurisé
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const context = await loadDashboardContext()
      setDashboardData(context)
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard :", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Chargement initial + Polling automatique
  useEffect(() => {
    fetchData(false)

    const intervalId = setInterval(() => {
      fetchData(true)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [fetchData])

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getAll()
      setNotifications((response.notifications || []).map((notification: any) => ({
        id: notification.id,
        title: notification.titre,
        message: notification.message,
        type: notification.type,
        date: new Date(notification.created_at).toLocaleString('fr-FR'),
        read: Boolean(notification.lu),
      })))
    } catch (error) {
      console.error('Erreur lors du chargement des notifications Direction :', error)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  const toggleDark = () => {
    const newDarkState = !isDark
    setIsDark(newDarkState)
    document.documentElement.classList.toggle('dark', newDarkState)
  }

  const handleMarkAsRead = (id: number) => {
    void notificationAPI.markRead(id).then(loadNotifications).catch(console.error)
  }

  const handleMarkAllAsRead = () => {
    void notificationAPI.markAllRead().then(loadNotifications).catch(console.error)
  }

  const handleDelete = (id: number) => {
    void notificationAPI.delete(id).then(loadNotifications).catch(console.error)
  }

  const menuItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/dashboard/directeur' },
    { icon: Building, label: 'Mes Entreprises', id: 'mesentreprises', path: '/dashboard/directeur/mesentreprises' },
    { icon: Building2, label: 'Mon Entreprise', id: 'entreprise', path: '/dashboard/directeur/entreprise' },
    { icon: Briefcase, label: 'Services', id: 'services', path: '/dashboard/directeur/services' },
    { icon: Briefcase, label: 'Postes', id: 'postes', path: '/dashboard/directeur/postes' },
    { icon: FileText, label: 'Offres', id: 'offres', path: '/dashboard/directeur/offres' },
    { icon: Users, label: 'Membres', id: 'membres', path: '/dashboard/directeur/membres' },
    { icon: UserCheck, label: 'Candidats', id: 'candidats', path: '/dashboard/directeur/candidats' },
    { icon: CheckSquare, label: 'Onboarding', id: 'onboarding', path: '/dashboard/directeur/onboarding' },
    { icon: Target, label: 'Evaluations', id: 'evaluations', path: '/dashboard/directeur/evaluations' },
    { icon: BookOpen, label: 'Formations', id: 'formations', path: '/dashboard/directeur/formations' },
    { icon: Award, label: 'Organigramme', id: 'organigramme', path: '/dashboard/directeur/organigramme' },
    { icon: DollarSign, label: 'Paie Avancee', id: 'paie', path: '/dashboard/directeur/paie' },
    { icon: MessageSquare, label: 'Communication', id: 'communication', path: '/dashboard/directeur/communication' },
    { icon: Send, label: 'Messagerie', id: 'messagerie', path: '/dashboard/directeur/messagerie' },
    { icon: Calendar, label: 'Calendrier', id: 'calendrier', path: '/dashboard/directeur/calendrier' },
    { icon: Clock, label: 'Pointage', id: 'pointage', path: '/dashboard/directeur/pointage' },
    { icon: CheckCircle2, label: 'Approbations', id: 'approbations', path: '/dashboard/directeur/approbations' },
    { icon: DollarSign, label: 'Notes de Frais', id: 'notesfrais', path: '/dashboard/directeur/notesfrais' },
    { icon: Briefcase, label: 'Equipements', id: 'equipements', path: '/dashboard/directeur/equipements' },
    { icon: Heart, label: 'Reconnaissances', id: 'reconnaissances', path: '/dashboard/directeur/reconnaissances' },
    { icon: FileText, label: 'Sondages', id: 'sondages', path: '/dashboard/directeur/sondages' },
    { icon: HeartIcon, label: 'Bien-etre', id: 'bienetre', path: '/dashboard/directeur/bienetre' },
    { icon: BookIcon, label: 'Knowledge Base', id: 'kb', path: '/dashboard/directeur/kb' },
    { icon: UsersIcon, label: 'Mentorat', id: 'mentorat', path: '/dashboard/directeur/mentorat' },
    { icon: ClockIcon, label: 'Timesheets', id: 'timesheets', path: '/dashboard/directeur/timesheets' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics', path: '/dashboard/directeur/analytics' },
    { icon: FileSignature, label: 'Signature', id: 'signature', path: '/dashboard/directeur/signature' },
    { icon: Plug, label: 'Integrations', id: 'integrations', path: '/dashboard/directeur/integrations' },
    { icon: Headphones, label: 'Support', id: 'support', path: '/dashboard/directeur/support' },
    { icon: Archive, label: 'Archivage', id: 'archivage', path: '/dashboard/directeur/archivage' },
    { icon: Shield, label: 'Audit Logs', id: 'audit', path: '/dashboard/directeur/audit' },
    { icon: Lock, label: 'Roles', id: 'permissions', path: '/dashboard/directeur/permissions' },
    { icon: Flag, label: 'Jours Feries', id: 'joursferies', path: '/dashboard/directeur/joursferies' },
    { icon: TrendingUp, label: 'Statistiques', id: 'stats', path: '/dashboard/directeur/stats' },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/directeur/notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres', path: '/dashboard/directeur/parametres' },
  ], [])

  const activeSection = useMemo(() => {
    const path = location.pathname
    for (const section of SECTIONS_ROUTES) {
      if (path.includes('/' + section)) return section
    }
    return 'dashboard'
  }, [location.pathname])

  const employes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const postes = useMemo(() => dashboardData?.postes || [], [dashboardData])
  const services = useMemo(() => dashboardData?.services || [], [dashboardData])
  const contrats = useMemo(() => dashboardData?.contrats || [], [dashboardData])
  const currentUser = useMemo(() => dashboardData?.user || {}, [dashboardData])
  const entrepriseName = useMemo(() => dashboardData?.entreprise?.nom || 'votre entreprise', [dashboardData])

  const notificationsReelles = useMemo(() => {
    const items: Array<{ id: number; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; date: string; read: boolean }> = []

    if (dashboardData?.conges?.some((conge: any) => conge.statut === 'En attente')) {
      items.push({ id: 1, title: 'Congés en attente', message: 'Des demandes de congé nécessitent une validation.', type: 'warning', date: 'Récemment', read: false })
    }

    if (dashboardData?.offres?.some((offre: any) => offre.statut === 'Publiée')) {
      items.push({ id: 2, title: 'Offres actives', message: 'Une ou plusieurs offres d\'emploi sont publiées.', type: 'success', date: 'Récemment', read: false })
    }

    return items
  }, [dashboardData])

  const serviceCounts = useMemo(() => {
    return services.map((service: any) => {
      const servicePosteIds = postes.filter((poste: any) => poste.id_service === service.id_service).map((poste: any) => poste.id_poste)
      const count = employes.filter((employe: any) => servicePosteIds.includes(employe.id_poste)).length
      return { name: service.nom, value: count, color: service.id_service % 2 === 0 ? '#8b5cf6' : '#f59e0b' }
    })
  }, [services, postes, employes])

  const chartData = useMemo(() => {
    return services.map((service: any) => {
      const servicePosteIds = postes.filter((poste: any) => poste.id_service === service.id_service).map((poste: any) => poste.id_poste)
      return { mois: service.nom, employes: employes.filter((employe: any) => servicePosteIds.includes(employe.id_poste)).length }
    })
  }, [services, postes, employes])

  const stats = useMemo(() => {
    const recrutementMois = employes.filter((employe: any) => {
      if (!employe.created_at) return false
      const createdAt = new Date(employe.created_at)
      const now = new Date()
      return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()
    }).length

    return {
      totalMembres: employes.length,
      hommes: employes.filter((e: any) => e.sexe === 'M').length,
      femmes: employes.filter((e: any) => e.sexe === 'F').length,
      masseSalariale: contrats.reduce((sum: number, c: any) => sum + Number(c.salaire_base || 0), 0),
      postesTotal: postes.length,
      postesOccupes: postes.filter((p: any) => ['Occupe', 'Occupé'].includes(p.statut)).length,
      postesVacants: postes.filter((p: any) => p.statut === 'Vacant').length,
      recrutementMois,
    }
  }, [employes, postes, contrats])

  const kpiCards = useMemo(() => [
    { icon: Users, label: 'Total Membres', value: stats.totalMembres, change: '+12% ce mois', color: 'from-primary-500 to-primary-700' },
    { icon: DollarSign, label: 'Masse Salariale', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.masseSalariale), change: '+8%', color: 'from-primary-600 to-primary-800' },
    { icon: Briefcase, label: 'Postes Occupés', value: `${stats.postesOccupes}/${stats.postesTotal}`, change: `${stats.postesVacants} vacants`, color: 'from-primary-500 to-primary-700' },
    { icon: Target, label: 'Recrutements', value: stats.recrutementMois, change: 'Ce mois', color: 'from-primary-600 to-primary-700' },
  ], [stats])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10">
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400"></div>
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-300 dark:border-t-primary-200"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Chargement de votre espace direction...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'mesentreprises': return <DirecteurMesEntreprisesPage />
      case 'entreprise': return <DirecteurEntreprisePage />
      case 'services': return <DirecteurServicesPage />
      case 'postes': return <DirecteurPostesPage />
      case 'offres': return <DirecteurOffresPage />
      case 'membres': return <DirecteurMembresPage />
      case 'candidats': return <DirecteurCandidatsPage />
      case 'onboarding': return <DirecteurOnboardingPage />
      case 'evaluations': return <DirecteurEvaluationsPage />
      case 'formations': return <DirecteurFormationsPage />
      case 'organigramme': return <DirecteurOrganigrammePage />
      case 'paie': return <DirecteurPaieAvanceePage />
      case 'communication': return <DirecteurCommunicationPage />
      case 'messagerie': return <DirecteurMessageriePage />
      case 'calendrier': return <DirecteurCalendrierPage />
      case 'pointage': return <DirecteurPointagePage />
      case 'approbations': return <DirecteurApprobationsPage />
      case 'notesfrais': return <DirecteurNotesFraisPage />
      case 'equipements': return <DirecteurEquipementsPage />
      case 'reconnaissances': return <DirecteurReconnaissancesPage />
      case 'sondages': return <DirecteurSondagesPage />
      case 'bienetre': return <DirecteurBienEtrePage />
      case 'kb': return <DirecteurKnowledgeBasePage />
      case 'mentorat': return <DirecteurMentoratPage />
      case 'timesheets': return <DirecteurTimesheetPage />
      case 'analytics': return <DirecteurAnalyticsPage />
      case 'signature': return <DirecteurSignaturePage />
      case 'integrations': return <DirecteurIntegrationsPage />
      case 'support': return <DirecteurTicketsPage />
      case 'archivage': return <DirecteurArchivagePage />
      case 'audit': return <DirecteurAuditLogsPage />
      case 'permissions': return <DirecteurPermissionsPage />
      case 'joursferies': return <DirecteurJoursFeriesPage />
      case 'stats': return <DirecteurStatistiquesPage />
      case 'notifications': return <DirecteurNotificationsPage />
      case 'parametres': return <DirecteurParametresPage />
      default:
        return (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="space-y-6"
          >
            {/* En-tête avec animation */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
            >
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 mb-3"
                >
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Espace Directeur</span>
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                  Tableau de bord Direction
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Vue stratégique de <strong>{entrepriseName}</strong></p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm transition-all text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
                <span>{isRefreshing ? 'Mise à jour...' : 'Actualiser'}</span>
              </motion.button>
            </motion.div>

            {/* KPI Cards avec animations */}
            <motion.div 
              variants={staggerChildren}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {kpiCards.map((kpi, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20`}
                    >
                      <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">{kpi.change}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Graphiques avec animations */}
            <motion.div 
              variants={staggerChildren}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div 
                variants={fadeInUp}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Évolution des effectifs
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Par service</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} opacity={0.3} />
                    <XAxis dataKey="mois" stroke={isDark ? '#94a3b8' : '#9ca3af'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#9ca3af'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: '#fff' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="employes" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDir)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    Répartition par service
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Employés</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={serviceCounts} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={5} 
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {serviceCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: '#fff' 
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            {/* Section d'activité rapide */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
            >
              {[
                { icon: Users, label: 'Nouveaux membres', value: stats.recrutementMois, color: 'from-primary-500 to-primary-600' },
                { icon: Briefcase, label: 'Postes vacants', value: stats.postesVacants, color: 'from-amber-500 to-amber-600' },
                { icon: Calendar, label: 'Congés en attente', value: dashboardData?.conges?.filter((c: any) => c.statut === 'En attente').length || 0, color: 'from-red-500 to-red-600' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10">
        {/* Sidebar avec animations */}
        <motion.aside 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <RHProLogo />
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-8 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')} 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </motion.button>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header avec animations */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="w-full pl-11 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white text-sm" 
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <NotificationBell
                  notifications={notificationsReelles.length > 0 ? notificationsReelles : notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />
                <motion.button 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                  onClick={toggleDark} 
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </motion.button>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20"
                  >
                    <span className="text-white font-bold text-sm">
                      {currentUser?.prenom ? currentUser.prenom.charAt(0).toUpperCase() : 'D'}
                    </span>
                  </motion.div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {currentUser?.prenom ? `${currentUser.prenom} ${currentUser.nom || ''}`.trim() : currentUser?.name || 'Directeur'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {currentUser?.role ? String(currentUser.role).toUpperCase() : 'DIRECTEUR'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-primary-50/10 to-primary-50/10 dark:from-slate-900 dark:via-primary-900/5 dark:to-primary-900/5">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}