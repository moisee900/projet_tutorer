import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, DollarSign, Calendar, Clock, FileText,
  Award, LogOut, Menu, X, Moon, Sun, Bell,
  User, Briefcase, Settings, Download, MessageSquare,
  ChevronRight, Users, AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { RHProLogo } from '../../components/brand/RHProLogo'
import { internalMessagingAPI, notificationAPI } from '../../services/api'
import { loadDashboardContext } from '../../services/dashboardData'
import { EmployeCongesPage } from './EmployeCongesPage'
import { EmployeDocumentsPage } from './EmployeDocumentsPage'
import { EmployeNotificationsPage } from './EmployeNotificationsPage'
import { EmployeParametresPage } from './EmployeParametresPage'
import { EmployePaiePage } from './EmployePaiePage'
import { EmployePresencesPage } from './EmployePresencesPage'
import { EmployeAvantagesPage } from './EmployeAvantagesPage'
import { DirecteurMessageriePage } from './DirecteurMessageriePage'

type EmployeeNotification = {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  date: string
  read: boolean
}

type User = {
  id: number
  prenom: string
  nom: string
  email: string
  matricule: string
  role: string
  statut: string
}

type Conversation = {
  id: number
  contact_prenom: string
  contact_nom: string
  dernier_message: string | null
  non_lus: number
  date_dernier_message: string | null
}

type Paie = {
  id_paie: number
  mois_paiement: string
  annee_paiement: string
  montant: number
  statut: string
}

type Conge = {
  id_conge: number
  type_conge: string
  date_debut: string
  date_fin: string
  statut: string
}

type Presence = {
  date_presence: string
  statut: string
}

type Document = {
  id_document: number
  type_document: string
  created_at: string
  statut: string
}

type Avantage = {
  id_avantage: number
  libelle: string
  type_avantage: string
  valeur: number
}

type DashboardData = {
  user: User
  fichesPaie: Paie[]
  conges: Conge[]
  presences: Presence[]
  documents: Document[]
  avantages: Avantage[]
}

export const EmployeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // ----- Data Loading -----
  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      try {
        const context = await loadDashboardContext(true)
        if (mounted) {
          setDashboardData(context)
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Impossible de charger votre espace personnel.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    const refreshId = window.setInterval(() => {
      void loadDashboardContext(true)
        .then((context) => {
          if (mounted) {
            setDashboardData(context)
          }
        })
        .catch(() => undefined)
    }, 30000)

    return () => {
      mounted = false
      window.clearInterval(refreshId)
    }
  }, [])

  // ----- Notifications -----
  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getAll()
      setNotifications((response.notifications || []).map((notification: any) => ({
        id: notification.id,
        title: notification.titre,
        message: notification.message,
        type: notification.type,
        date: new Date(notification.created_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        read: Boolean(notification.lu),
      })))
    } catch (error) {
      console.error('Erreur lors du chargement des notifications :', error)
    }
  }, [])

  const loadConversations = useCallback(async () => {
    try {
      const response = await internalMessagingAPI.getConversations()
      setRecentConversations((response.conversations || []).slice(0, 3))
    } catch (error) {
      console.error('Erreur lors du chargement des conversations :', error)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    void loadConversations()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    const conversationsIntervalId = window.setInterval(() => void loadConversations(), 5000)
    return () => {
      window.clearInterval(intervalId)
      window.clearInterval(conversationsIntervalId)
    }
  }, [loadNotifications, loadConversations])

  // ----- Theme -----
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleDark = () => setIsDark(prev => !prev)

  // ----- Handlers -----
  const handleMarkAsRead = useCallback((id: number) => {
    void notificationAPI.markRead(id).then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  const handleMarkAllAsRead = useCallback(() => {
    void notificationAPI.markAllRead().then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  const handleDelete = useCallback((id: number) => {
    void notificationAPI.delete(id).then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  // ----- Computed Values -----
  const user = dashboardData?.user
  const userPaies = useMemo(() => {
    if (!dashboardData?.fichesPaie) return []
    return [...dashboardData.fichesPaie].sort((a, b) => {
      const aPeriod = Number(a.annee_paiement) * 100 + Number(a.mois_paiement)
      const bPeriod = Number(b.annee_paiement) * 100 + Number(b.mois_paiement)
      return bPeriod - aPeriod || Number(b.id_paie) - Number(a.id_paie)
    })
  }, [dashboardData?.fichesPaie])

  const userConges = dashboardData?.conges || []
  const userPresences = dashboardData?.presences || []
  const userDocuments = dashboardData?.documents || []
  const userAvantages = dashboardData?.avantages || []

  const unreadNotificationCount = notifications.filter(n => !n.read).length
  const unreadMessageCount = recentConversations.reduce((total, conv) => total + (conv.non_lus || 0), 0)

  // ----- Menu -----
  const menuItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dashboard', path: '/dashboard/employe' },
    { icon: DollarSign, label: 'Mes paies', id: 'paies', path: '/dashboard/employe/paies' },
    { icon: Calendar, label: 'Mes congés', id: 'conges', path: '/dashboard/employe/conges' },
    { icon: Clock, label: 'Mes présences', id: 'presences', path: '/dashboard/employe/presences' },
    { icon: FileText, label: 'Mes documents', id: 'documents', path: '/dashboard/employe/documents' },
    { icon: Award, label: 'Mes avantages', id: 'avantages', path: '/dashboard/employe/avantages' },
    { icon: MessageSquare, label: 'Messagerie', id: 'messagerie', path: '/dashboard/employe/messagerie', badge: unreadMessageCount },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/employe/notifications', badge: unreadNotificationCount },
    { icon: Settings, label: 'Paramètres', id: 'parametres', path: '/dashboard/employe/parametres' },
  ], [unreadMessageCount, unreadNotificationCount])

  const activeSection = useMemo(() => {
    const path = location.pathname
    if (path.includes('/paies')) return 'paies'
    if (path.includes('/conges')) return 'conges'
    if (path.includes('/presences')) return 'presences'
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/avantages')) return 'avantages'
    if (path.includes('/messagerie')) return 'messagerie'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    return 'dashboard'
  }, [location.pathname])

  // ----- Stats -----
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const normalizeStatus = (status: string | undefined) => {
    if (!status) return ''
    return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }

  const currentMonthPresences = useMemo(() => {
    return userPresences.filter((presence: Presence) => {
      const date = new Date(`${presence.date_presence}T00:00:00`)
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
    })
  }, [userPresences, currentYear, currentMonth])

  const stats = useMemo(() => ({
    dernierSalaire: Number(userPaies[0]?.montant || 0),
    cumulAnnuel: userPaies
      .filter((paie: Paie) => Number(paie.annee_paiement) === currentYear)
      .reduce((sum: number, paie: Paie) => sum + Number(paie.montant || 0), 0),
    joursPresence: currentMonthPresences.filter((p: Presence) => normalizeStatus(p.statut) === 'present').length,
    joursRetard: currentMonthPresences.filter((p: Presence) => normalizeStatus(p.statut) === 'retard').length,
    joursAbsence: currentMonthPresences.filter((p: Presence) => normalizeStatus(p.statut) === 'absent').length,
  }), [userPaies, currentMonthPresences, currentYear])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const presenceData = [
    { name: 'Présents', value: stats.joursPresence, color: '#10b981' },
    { name: 'Retards', value: stats.joursRetard, color: '#f59e0b' },
    { name: 'Absences', value: stats.joursAbsence, color: '#ef4444' },
  ]

  // ----- Loading & Error States -----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (loadError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Accès impossible</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{loadError || 'Votre identité employé n\'a pas pu être vérifiée.'}</p>
        </div>
      </div>
    )
  }

  // ----- Render Content -----
  const renderContent = () => {
    switch (activeSection) {
      case 'paies': return <EmployePaiePage />
      case 'conges': return <EmployeCongesPage />
      case 'presences': return <EmployePresencesPage />
      case 'documents': return <EmployeDocumentsPage />
      case 'avantages': return <EmployeAvantagesPage />
      case 'messagerie': return <DirecteurMessageriePage />
      case 'notifications': return <EmployeNotificationsPage />
      case 'parametres': return <EmployeParametresPage />
      default:
        return (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Bonjour, <span className="text-indigo-600 dark:text-indigo-400">{user.prenom}</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Aperçu de votre activité professionnelle
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {user.matricule}
                </span>
              </div>
            </div>

            {/* Profile */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm border border-emerald-100 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Actif
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm">
                    <Users className="w-3.5 h-3.5" />
                    Employé
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { 
                  icon: DollarSign, 
                  label: 'Dernier salaire', 
                  value: formatCurrency(stats.dernierSalaire),
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30'
                },
                { 
                  icon: Briefcase, 
                  label: 'Total annuel', 
                  value: formatCurrency(stats.cumulAnnuel),
                  color: 'text-indigo-600 dark:text-indigo-400',
                  bg: 'bg-indigo-50 dark:bg-indigo-950/30'
                },
                { 
                  icon: FileText, 
                  label: 'Documents', 
                  value: userDocuments.length.toString(),
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-50 dark:bg-amber-950/30'
                },
                { 
                  icon: Clock, 
                  label: 'Présences (mois)', 
                  value: stats.joursPresence.toString(),
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-950/30'
                },
              ].map((kpi, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{kpi.value}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pay Slips */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Dernières paies
                  </h3>
                  {userPaies.length > 0 && (
                    <button 
                      onClick={() => navigate('/dashboard/employe/paies')}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                    >
                      Voir tout <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {userPaies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                      <DollarSign className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune fiche de paie</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userPaies.slice(0, 3).map((paie) => (
                      <div 
                        key={paie.id_paie} 
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => navigate('/dashboard/employe/paies')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white text-sm">
                              {paie.mois_paiement} {paie.annee_paiement}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">#{paie.id_paie}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-white">
                            {formatCurrency(Number(paie.montant || 0))}
                          </p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            paie.statut === 'Payée' || paie.statut === 'Payee' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                          }`}>
                            {paie.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Présences du mois
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {currentMonth}/{currentYear}
                  </span>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={presenceData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {presenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '6px 10px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`${value} jour${value > 1 ? 's' : ''}`]}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={7}
                        formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Messages & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Messages */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Messages
                  </h3>
                  <button 
                    onClick={() => navigate('/dashboard/employe/messagerie')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {recentConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucun message</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentConversations.map((conv) => (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => navigate('/dashboard/employe/messagerie')}
                        className="w-full rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                                {conv.contact_prenom} {conv.contact_nom}
                              </p>
                              {conv.non_lus > 0 && (
                                <span className="min-w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                                  {conv.non_lus}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {conv.dernier_message || 'Démarrer une conversation'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Notifications
                  </h3>
                  <button 
                    onClick={() => navigate('/dashboard/employe/notifications')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {notifications.slice(0, 3).map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl transition-colors ${
                          n.read 
                            ? 'bg-slate-50 dark:bg-slate-800/30' 
                            : 'bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">{n.date}</p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex-shrink-0"
                            >
                              Lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Leave & Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Leave */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Congés
                  </h3>
                  <button 
                    onClick={() => navigate('/dashboard/employe/conges')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {userConges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune demande</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userConges.slice(0, 3).map((c) => (
                      <div key={c.id_conge} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                              {c.type_conge}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {c.date_debut} → {c.date_fin}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          c.statut === 'Approuvé' || c.statut === 'Approuve'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : c.statut === 'En attente'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        }`}>
                          {c.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Avantages
                  </h3>
                  <button 
                    onClick={() => navigate('/dashboard/employe/avantages')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {userAvantages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                      <Award className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucun avantage</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userAvantages.slice(0, 3).map((a) => (
                      <div key={a.id_avantage} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
                            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                              {a.libelle}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{a.type_avantage}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm flex-shrink-0">
                          {formatCurrency(Number(a.valeur || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Documents
                </h3>
                <button 
                  onClick={() => navigate('/dashboard/employe/documents')}
                  className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                >
                  Voir tout <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {userDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun document</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userDocuments.slice(0, 3).map((doc) => (
                    <div 
                      key={doc.id_document} 
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                              {doc.type_document}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{doc.created_at}</p>
                          </div>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.statut === 'Validé' || doc.statut === 'Valide'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {doc.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  // ----- Main Render -----
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <RHProLogo />
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-secondary-500 to-primary-600 text-white shadow-lg' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-red-500/25">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>

              <div className="flex items-center gap-1 ml-auto">
                <button 
                  onClick={toggleDark} 
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Basculer le mode sombre"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>

                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => navigate('/dashboard/employe/parametres')}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="font-medium text-slate-800 dark:text-white text-sm leading-tight">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Employé</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}