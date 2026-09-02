import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Building2, Users, Shield, Server, Settings,
  LogOut, Menu, X, Moon, Sun, Search, Bell, Eye
} from 'lucide-react'
import { NotificationBell } from '../../components/NotificationBell'
import { notificationAPI } from '../../services/api'
import { AdminEntreprisesPage } from './AdminEntreprisesPage'
import { AdminUsersPage } from './AdminUsersPage'
import { AdminSecurityPage } from './AdminSecurityPage'
import { AdminSystemPage } from './AdminSystemPage'
import { AdminSettingsPage } from './AdminSettingsPage'
import { AdminNotificationsPage } from './AdminNotificationsPage'

export const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  const toggleDark = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

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
      console.error('Erreur lors du chargement des notifications administrateur :', error)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  const handleMarkAsRead = (id: number) => {
    void notificationAPI.markRead(id).then(loadNotifications).catch(console.error)
  }

  const handleMarkAllAsRead = () => {
    void notificationAPI.markAllRead().then(loadNotifications).catch(console.error)
  }

  const handleDelete = (id: number) => {
    void notificationAPI.delete(id).then(loadNotifications).catch(console.error)
  }

  // Super Admin = DEVELOPPEUR, supervise seulement
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/dashboard/admin' },
    { icon: Building2, label: 'Entreprises', id: 'entreprises', path: '/dashboard/admin/entreprises' },
    { icon: Users, label: 'Utilisateurs', id: 'users', path: '/dashboard/admin/users' },
    { icon: Shield, label: 'Securite', id: 'securite', path: '/dashboard/admin/securite' },
    { icon: Server, label: 'Systeme', id: 'systeme', path: '/dashboard/admin/systeme' },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/admin/notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres', path: '/dashboard/admin/parametres' },
  ]

  const getCurrentSection = () => {
    const path = location.pathname
    if (path.includes('/entreprises')) return 'entreprises'
    if (path.includes('/users')) return 'users'
    if (path.includes('/securite')) return 'securite'
    if (path.includes('/systeme')) return 'systeme'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    return 'dashboard'
  }

  const activeSection = getCurrentSection()

  const renderContent = () => {
    switch (activeSection) {
      case 'entreprises': return <AdminEntreprisesPage />
      case 'users': return <AdminUsersPage />
      case 'securite': return <AdminSecurityPage />
      case 'systeme': return <AdminSystemPage />
      case 'notifications': return <AdminNotificationsPage />
      case 'parametres': return <AdminSettingsPage />
      default:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Super Administrateur</h1>
              <p className="text-slate-600 dark:text-slate-400">Supervision globale du systeme (Developpeur)</p>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Role : Super Administrateur (Developpeur)</h3>
                  <p className="text-sm text-white/90">Vous etes le developpeur de la plateforme. Votre role est de superviser le systeme dans son ensemble. La gestion des postes, candidats et entretiens est deleguee aux Directeurs de chaque entreprise.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Users, label: 'Total Utilisateurs', value: '7', change: '+12%', color: 'from-primary-500 to-primary-600' },
                { icon: Building2, label: 'Entreprises', value: '2', change: '+8%', color: 'from-primary-500 to-primary-600' },
                { icon: Shield, label: 'Securite', value: '99%', change: 'OK', color: 'from-primary-500 to-primary-600' },
                { icon: Server, label: 'Uptime', value: '99.9%', change: 'Stable', color: 'from-primary-500 to-primary-600' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                    <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">{kpi.change}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Supervision</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Entreprises actives</span>
                    <span className="font-bold text-slate-800 dark:text-white">2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Directeurs</span>
                    <span className="font-bold text-slate-800 dark:text-white">1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total employes</span>
                    <span className="font-bold text-slate-800 dark:text-white">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Offres publiees</span>
                    <span className="font-bold text-slate-800 dark:text-white">3</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Building2, label: 'Entreprises', path: '/dashboard/admin/entreprises', color: 'from-primary-500 to-primary-600' },
                    { icon: Users, label: 'Utilisateurs', path: '/dashboard/admin/users', color: 'from-primary-500 to-primary-600' },
                    { icon: Shield, label: 'Securite', path: '/dashboard/admin/securite', color: 'from-primary-500 to-primary-600' },
                    { icon: Server, label: 'Systeme', path: '/dashboard/admin/systeme', color: 'from-primary-500 to-primary-600' },
                  ].map((item, i) => (
                    <button key={i} onClick={() => navigate(item.path)} className={`flex flex-col items-center justify-center p-4 bg-gradient-to-br ${item.color} text-white rounded-xl hover:shadow-lg transition-all`}>
                      <item.icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-pink-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">RH Manager</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
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

              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-red-500" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
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
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">SA</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Super Admin</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Developpeur</p>
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