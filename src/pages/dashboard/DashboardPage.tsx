import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, Building2, Calendar, DollarSign, FileText,
  Sun, Moon, Home, Menu, MoreHorizontal, X,
  Sparkles, ArrowRight, Crown, Award, Clock,
  UserPlus, Settings, Bell, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandMark } from '../../components/BrandMark'

// Animations variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
}

const fadeInDown = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 25,
      duration: 0.9
    }
  }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 25,
      duration: 0.9
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

// Composant StatCard
const StatCard = ({ icon: Icon, label, value, color, change, delay = 0 }: any) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotate({ x: y * -8, y: x * 8 })
  }

  const colors = {
    primary: "from-primary-500 to-primary-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    rose: "from-rose-500 to-rose-600"
  }

  const isPositive = change?.startsWith('+')
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600'

  return (
    <motion.div
      ref={cardRef}
      custom={delay}
      variants={fadeInUpStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotate({ x: 0, y: 0 }) }}
      onMouseMove={handleMouseMove}
      style={{ transform: `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
      className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: isHovered ? ['-100%', '100%'] : '-100%',
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className={`w-14 h-14 bg-gradient-to-br ${colors[color] || colors.primary} rounded-2xl flex items-center justify-center shadow-xl`}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          {change && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-sm font-bold ${changeColor} bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700`}
            >
              {change}
            </motion.span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
          {label}
        </p>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-slate-800 dark:text-white"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  )
}

// Composant ActivityItem
const ActivityItem = ({ icon: Icon, text, time, color, delay = 0 }: any) => {
  const colors = {
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
  }

  return (
    <motion.div 
      variants={fadeInUpStagger}
      custom={delay}
      whileHover={{ x: 5 }}
      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color] || colors.primary}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 dark:text-white">{text}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{time}</p>
      </div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ArrowRight className="w-4 h-4 text-slate-500" />
      </motion.div>
    </motion.div>
  )
}

// Composant QuickAction
const QuickAction = ({ icon: Icon, label, color, delay = 0 }: any) => {
  const colors = {
    primary: "from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",
    emerald: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    amber: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    rose: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
  }

  return (
    <motion.button
      variants={fadeInUpStagger}
      custom={delay}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${colors[color] || colors.primary} text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group`}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
      </motion.div>
      <span className="text-sm font-bold">{label}</span>
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        className="w-0 h-0.5 bg-white/50 mt-1 transition-all duration-300 group-hover:w-8"
      />
    </motion.button>
  )
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Gestion du Mode Sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const stats = [
    { icon: Users, label: 'Total Employés', value: '142', color: 'primary', change: '+12%' },
    { icon: Building2, label: 'Services', value: '8', color: 'emerald', change: '+2' },
    { icon: DollarSign, label: 'Masse salariale', value: '245K $', color: 'amber', change: '+8%' },
    { icon: Calendar, label: 'Congés ce mois', value: '12', color: 'purple', change: '-3' },
  ]

  const activities = [
    { icon: FileText, text: 'Nouveau contrat signé', time: 'Il y a 2h', color: 'green' },
    { icon: Users, text: '3 nouveaux employés', time: 'Il y a 5h', color: 'blue' },
    { icon: Calendar, text: 'Congé approuvé', time: 'Hier', color: 'primary' },
    { icon: Award, text: 'Prime exceptionnelle validée', time: 'Hier', color: 'amber' },
  ]

  const quickActions = [
    { icon: UserPlus, label: 'Ajouter employé', color: 'primary' },
    { icon: FileText, label: 'Nouveau contrat', color: 'emerald' },
    { icon: DollarSign, label: 'Générer paie', color: 'amber' },
    { icon: Calendar, label: 'Voir congés', color: 'purple' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden transition-colors duration-300">
      
      {/* Éléments d'ambiance en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
          animate={pulseGlow}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
          animate={{
            ...pulseGlow,
            transition: { ...pulseGlow.transition, delay: 0.5 }
          }}
        />
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="group">
                <BrandMark subtitle="Dashboard" />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm w-48 transition-all"
                />
              </div>

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="hidden md:flex p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <span className="text-lg font-extrabold text-white">
                      {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800 dark:text-white">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 md:hidden rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                aria-label="Ouvrir le menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <span className="text-xl font-extrabold text-white">
                      {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <nav className="flex flex-col space-y-3 font-medium">
                  <Link to="/dashboard" className="py-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Tableau de bord
                  </Link>
                  <Link to="/employes" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Employés
                  </Link>
                  <Link to="/contrats" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Contrats
                  </Link>
                  <Link to="/parametres" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Paramètres
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div variants={fadeInDown} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary-500" />
                </motion.div>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  Vue d'ensemble
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
                Tableau de bord
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Bienvenue, <span className="font-bold text-primary-600 dark:text-primary-400">{user?.prenom} {user?.nom}</span> 👋
              </p>
            </div>
            <motion.div 
              variants={fadeInDown}
              className="flex items-center space-x-3"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Nouveau rapport</span>
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Statistiques */}
        <motion.div 
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              change={stat.change}
              delay={index}
            />
          ))}
        </motion.div>

        {/* Activité récente et Actions rapides */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Activité récente */}
          <motion.div 
            variants={fadeInLeft}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20"
                >
                  <Clock className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Activité récente</h2>
              </div>
              <motion.button
                whileHover={{ x: 3 }}
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Voir tout →
              </motion.button>
            </div>
            <div className="space-y-2">
              {activities.map((item, index) => (
                <ActivityItem 
                  key={index}
                  icon={item.icon}
                  text={item.text}
                  time={item.time}
                  color={item.color}
                  delay={index}
                />
              ))}
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div 
            variants={fadeInRight}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Actions rapides</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <QuickAction 
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  color={action.color}
                  delay={index}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Navigation mobile */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: .96 }}
              className="mb-3 flex justify-center gap-2 rounded-2xl bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl"
            >
              <Link to="/dashboard" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Dashboard</Link>
              <Link to="/employes" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Employés</Link>
              <Link to="/contrats" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Contrats</Link>
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="flex items-center justify-around rounded-2xl border border-white/15 bg-slate-900/80 px-2 py-2 shadow-2xl backdrop-blur-xl">
          <Link to="/dashboard" aria-label="Dashboard" className="rounded-xl p-3 text-primary-300 hover:bg-white/10"><Home className="h-5 w-5" /></Link>
          <Link to="/employes" aria-label="Employés" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Users className="h-5 w-5" /></Link>
          <button aria-label="Ouvrir le menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="-mt-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white shadow-lg shadow-primary-500/40 ring-4 ring-slate-900/80">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
          </button>
          <Link to="/contrats" aria-label="Contrats" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><FileText className="h-5 w-5" /></Link>
          <Link to="/parametres" aria-label="Paramètres" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Settings className="h-5 w-5" /></Link>
        </nav>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient { animation: none; }
        }
      `}</style>
    </div>
  )
}