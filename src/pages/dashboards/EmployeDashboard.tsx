import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, DollarSign, Calendar, Clock, FileText,
  Award, LogOut, Menu, X, Moon, Sun, Search, Bell,
  User, Briefcase, Settings, Download, MessageSquare
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
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

export const EmployeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([])
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

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

  const loadNotifications = async () => {
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
      console.error('Erreur lors du chargement des notifications employé :', error)
    }
  }

  const loadRecentConversations = async () => {
    try {
      const response = await internalMessagingAPI.getConversations()
      setRecentConversations((response.conversations || []).slice(0, 3))
    } catch (error) {
      console.error('Erreur lors du chargement des conversations employé :', error)
    }
  }

  useEffect(() => {
    void loadNotifications()
    void loadRecentConversations()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    const conversationsIntervalId = window.setInterval(() => void loadRecentConversations(), 5000)
    return () => {
      window.clearInterval(intervalId)
      window.clearInterval(conversationsIntervalId)
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Chargement de votre espace personnel...</div>
  }

  if (loadError || !dashboardData?.user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center text-red-700">{loadError || 'Votre identité employé n’a pas pu être vérifiée.'}</div>
  }

  const user = dashboardData.user
  const userPaies = [...(dashboardData.fichesPaie || [])].sort((first: any, second: any) => {
    const firstPeriod = Number(first.annee_paiement) * 100 + Number(first.mois_paiement)
    const secondPeriod = Number(second.annee_paiement) * 100 + Number(second.mois_paiement)
    return secondPeriod - firstPeriod || Number(second.id_paie) - Number(first.id_paie)
  })
  const userConges = dashboardData.conges || []
  const userPresences = dashboardData.presences || []
  const userDocuments = dashboardData.documents || []
  const userAvantages = dashboardData.avantages || []
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length
  const unreadMessageCount = recentConversations.reduce((total, conversation) => total + Number(conversation.non_lus || 0), 0)

  const toggleDark = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Mon Espace', id: 'dashboard', path: '/dashboard/employe' },
    { icon: DollarSign, label: 'Mes Paies', id: 'paies', path: '/dashboard/employe/paies' },
    { icon: Calendar, label: 'Mes Conges', id: 'conges', path: '/dashboard/employe/conges' },
    { icon: Clock, label: 'Mes Presences', id: 'presences', path: '/dashboard/employe/presences' },
    { icon: FileText, label: 'Mes Documents', id: 'documents', path: '/dashboard/employe/documents' },
    { icon: Award, label: 'Mes Avantages', id: 'avantages', path: '/dashboard/employe/avantages' },
    { icon: MessageSquare, label: 'Messagerie', id: 'messagerie', path: '/dashboard/employe/messagerie', badge: unreadMessageCount },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/employe/notifications', badge: unreadNotificationCount },
    { icon: Settings, label: 'Parametres', id: 'parametres', path: '/dashboard/employe/parametres' },
  ]

  const getCurrentSection = () => {
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
  }

  const activeSection = getCurrentSection()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const normalizeStatus = (status: string | undefined) => (status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const currentMonthPresences = userPresences.filter((presence: any) => {
    const date = new Date(`${presence.date_presence}T00:00:00`)
    return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
  })
  const stats = {
    dernierSalaire: Number(userPaies[0]?.montant || 0),
    cumulAnnuel: userPaies
      .filter((paie: any) => Number(paie.annee_paiement) === currentYear)
      .reduce((sum: number, paie: any) => sum + Number(paie.montant || 0), 0),
    joursPresence: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'present').length,
    joursRetard: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'retard').length,
    joursAbsence: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'absent').length,
  }
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)

  const presenceData = [
    { name: 'Presents', value: stats.joursPresence, color: '#10b981' },
    { name: 'Retards', value: stats.joursRetard, color: '#f59e0b' },
    { name: 'Absences', value: stats.joursAbsence, color: '#ef4444' },
  ]

  const kpiCards = [
    { icon: DollarSign, label: 'Dernière paie', value: formatCurrency(stats.dernierSalaire), color: 'from-primary-500 to-primary-600' },
    { icon: Briefcase, label: 'Cumul annuel', value: formatCurrency(stats.cumulAnnuel), color: 'from-primary-500 to-primary-600' },
    { icon: FileText, label: 'Documents', value: userDocuments.length, color: 'from-primary-500 to-primary-600' },
    { icon: Clock, label: 'Présences ce mois', value: stats.joursPresence, color: 'from-primary-500 to-primary-600' },
  ]

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
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Bonjour, {user.prenom} ! 👋</h1>
              <p className="text-slate-600 dark:text-slate-400">Voici un resume de votre espace personnel</p>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.prenom} {user.nom}</h2>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <p className="text-white/60 text-xs mt-1">Matricule: {user.matricule}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kpiCards.map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                    <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes dernieres fiches de paie</h3>
                {userPaies.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune fiche de paie disponible</p>
                ) : (
                  <div className="space-y-3">
                    {userPaies.slice(0, 3).map((paie) => (
                      <div key={paie.id_paie} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{paie.mois_paiement} {paie.annee_paiement}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ref: #{paie.id_paie}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(Number(paie.montant || 0))}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${paie.statut === 'Payee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                            {paie.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes presences ce mois</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={presenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => name + ': ' + value}>
                      {presenceData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Derniers messages internes</h3>
                {recentConversations.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune conversation active pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {recentConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => navigate('/dashboard/employe/messagerie')}
                        className="w-full rounded-xl bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                              {conversation.contact_prenom} {conversation.contact_nom}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {conversation.dernier_message || 'Ouvrir la conversation'}
                            </p>
                          </div>
                          <div className="text-right">
                            {conversation.non_lus > 0 && (
                              <span className="inline-flex items-center justify-center rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
                                {conversation.non_lus}
                              </span>
                            )}
                            <p className="mt-1 text-[11px] text-slate-400">
                              {conversation.date_dernier_message ? new Date(conversation.date_dernier_message).toLocaleString('fr-FR') : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Notifications récentes</h3>
                {notifications.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune notification reçue.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{notification.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${notification.read ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'}`}>
                            {notification.read ? 'Lu' : 'Nouveau'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes demandes de conges</h3>
                {userConges.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune demande de conge</p>
                ) : (
                  <div className="space-y-3">
                    {userConges.map((conge) => (
                      <div key={conge.id_conge} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{conge.type_conge}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{conge.date_debut} → {conge.date_fin}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conge.statut === 'Approuve' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                          conge.statut === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {conge.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes avantages</h3>
                {userAvantages.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucun avantage disponible</p>
                ) : (
                  <div className="space-y-3">
                    {userAvantages.map((avantage) => (
                      <div key={avantage.id_avantage} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{avantage.libelle}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{avantage.type_avantage}</p>
                          </div>
                        </div>
                        <span className="font-bold text-amber-600 dark:text-amber-300">{formatCurrency(Number(avantage.valeur || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes documents</h3>
              {userDocuments.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucun document disponible</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDocuments.map((doc) => (
                    <div key={doc.id_document} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{doc.type_document}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{doc.created_at}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.statut === 'Valide' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {doc.statut}
                        </span>
                        <button className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
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

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <RHProLogo />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
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

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Deconnexion</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Menu className="w-6 h-6" /></button>
              <div className="flex items-center space-x-4 ml-auto">
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.prenom[0]}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employe</p>
                  </div>
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