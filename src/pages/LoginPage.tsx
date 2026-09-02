import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Building2, Mail, Lock, Eye, EyeOff, Users, LogIn, Loader2, 
  Sparkles, TrendingUp, ShieldCheck, ArrowRight, Activity, Cpu,
  Sun, Moon, X, Home, Briefcase, Menu, MoreHorizontal, Crown
} from 'lucide-react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Toast } from '../components/ui/Toast'
import { API_BASE_URL } from '../config/api'
import { BrandMark } from '../components/BrandMark'

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

const fadeInUpStagger = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  })
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

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 4,
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

// Composant AnimatedCounter
const AnimatedCounter = ({ target, duration = 2000, suffix = '', prefix = '' }: { target: number, duration?: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [isInView, target, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Composant StatCard
const StatCard = ({ icon: Icon, label, value, loading, color = "primary", suffix = "" }: any) => {
  const colors = {
    primary: "from-primary-500 to-primary-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600"
  }

  return (
    <motion.div 
      variants={fadeInUpStagger}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 hover:bg-white/90 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/10 shadow-sm transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className={`w-8 h-8 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20`}
        >
          <Icon className="w-4 h-4 text-white" />
        </motion.div>
      </div>
      <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-baseline">
        {loading ? (
          <span className="text-lg text-slate-400 dark:text-slate-500 animate-pulse">...</span>
        ) : (
          <AnimatedCounter target={value} duration={2000} />
        )}
        <span className="text-xs text-primary-600 dark:text-primary-400 ml-1 font-normal group-hover:translate-x-0.5 transition-transform">{suffix}</span>
      </div>
    </motion.div>
  )
}

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  
  // États pour les vraies données de la base
  const [stats, setStats] = useState({ utilisateurs: 0, entreprises: 0, contrats_actifs: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  const navigate = useNavigate()
  const { login } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)

  // Résolution et nettoyage dynamique de l'URL de l'API
  const API_URL = useMemo(() => API_BASE_URL, [])

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

  // Effet parallaxe sur le hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      
      const elements = heroRef.current.querySelectorAll('.parallax')
      elements.forEach((el: any) => {
        const speed = parseFloat(el.dataset.speed || '1')
        el.style.transform = `translate(${x * speed * 20}px, ${y * speed * 20}px)`
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered') === '1') {
      setToast({ type: 'success', message: 'Compte créé avec succès. Vous pouvez vous connecter.' })
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stats-accueil`)
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
        const result = await res.json()
        if (result.success) {
          setStats({
            utilisateurs: result.data.utilisateurs || 0,
            entreprises: result.data.entreprises || 0,
            contrats_actifs: result.data.contrats_actifs || 0
          })
        }
      } catch (error) {
        console.error("Erreur de récupération des statistiques :", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [API_URL])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast({ type: 'info', message: 'Connexion en cours...' })

    const result = await login(email, password)
    if (result.success && result.user) {
      setToast({ type: 'success', message: 'Connexion réussie. Redirection en cours...' })
      const dashboardPath = result.user.role === 'admin' || result.user.role === 'it'
        ? '/dashboard/admin'
        : result.user.role === 'directeur'
          ? '/dashboard/directeur'
          : result.user.role === 'rh'
            ? '/dashboard/rh'
            : result.user.role === 'utilisateur'
              ? '/dashboard/utilisateur'
              : '/dashboard/employe'

      setTimeout(() => navigate(dashboardPath), 700)
    } else {
      setToast({ type: 'error', message: result.message || 'Email ou mot de passe incorrect' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden transition-colors duration-300">
      
      {/* Éléments d'ambiance en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
          animate={pulseGlow}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"
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
            <Link to="/" className="group">
              <BrandMark subtitle="Connexion sécurisée" />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/offres" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Offres d'emploi</Link>
              <Link to="/features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Fonctionnalités</Link>
              <Link to="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">S'inscrire</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                  S'inscrire
                </Link>
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

        {/* --- MENU MOBILE --- */}
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
                <nav className="flex flex-col space-y-3 font-medium">
                  <Link 
                    to="/offres" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Offres d'emploi
                  </Link>
                  <Link 
                    to="/features" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Fonctionnalités
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    S'inscrire
                  </Link>
                </nav>
                
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg shadow-lg"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div ref={heroRef} className="relative z-10 pt-20 pb-16 flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-stretch"
        >
          
          {/* --- PANNEAU GAUCHE : FORMULAIRE DE CONNEXION --- */}
          <motion.div 
            variants={fadeInLeft}
            className="lg:col-span-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800/80 p-8 flex flex-col justify-between transition-all hover:border-slate-300/50 dark:hover:border-slate-700/80"
          >
            <div>
              <motion.div 
                variants={fadeInDown}
                className="text-center mb-8"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="w-20 h-20 bg-gradient-to-tr from-primary-600 via-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Building2 className="w-10 h-10 text-white transform group-hover:scale-110 transition-transform duration-300" />
                  </motion.div>
                </motion.div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Bienvenue
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Heureux de vous revoir sur RH Manager
                </p>
              </motion.div>

              {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

              <motion.form 
                variants={fadeInUp}
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email de connexion
                  </label>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                      placeholder="votre@email.com"
                      required
                    />
                  </motion.div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Mot de passe
                  </label>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </motion.div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-500 hover:from-primary-700 hover:via-purple-700 hover:to-primary-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl shadow-primary-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
                </motion.button>
              </motion.form>
            </div>

            <motion.div 
              variants={fadeInUp}
              className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center"
            >
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                Données chiffrées & Connexion sécurisée
              </span>
            </motion.div>
          </motion.div>

          {/* --- PANNEAU DROITE : ADAPTATIF MODE SOMBRE / CLAIR --- */}
          <motion.div 
            variants={fadeInRight}
            className="lg:col-span-7 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950 dark:to-[#0c0f1d] rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300"
          >
            
            {/* Effets lumineux internes réactifs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* En-tête réactive */}
            <motion.div 
              variants={fadeInDown}
              className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-2.5 bg-slate-200/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300/30 dark:border-white/10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </motion.div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase">
                  Dashboard RH Manager Live
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
                <span>Base active</span>
              </div>
            </motion.div>

            {/* Graphique réactif */}
            <motion.div 
              variants={fadeInUp}
              className="relative z-10 my-8 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md dark:shadow-inner"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Activity className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </motion.div>
                    Tendance de l'Écosystème
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Croissance globale de la plateforme</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Statut</span>
                  <div className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center justify-end">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                    </motion.div>
                    +14.2%
                  </div>
                </div>
              </div>

              {/* Courbes SVG adaptatives */}
              <div className="h-32 relative flex items-end">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 C15,80 30,85 45,60 C60,35 75,45 100,20 L100,100 Z" fill="url(#gradient-area)" />
                  <path d="M0,100 C15,80 30,85 45,60 C60,35 75,45 100,20" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0,100 C20,90 40,75 60,65 C80,55 90,40 100,35" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.6" />
                </svg>

                {/* Points lumineux réactifs */}
                <motion.span 
                  className="absolute w-3.5 h-3.5 bg-primary-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
                  style={{ left: '44%', bottom: '37%' }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.span 
                  className="absolute w-3.5 h-3.5 bg-primary-500 dark:bg-primary-400 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
                  style={{ left: '98%', bottom: '77%' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Micro-cartes statistiques réactives */}
            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="relative z-10 grid grid-cols-3 gap-4"
            >
              <StatCard 
                icon={Users} 
                label="Membres" 
                value={stats.utilisateurs} 
                loading={loadingStats}
                color="primary"
                suffix="pro"
              />
              <StatCard 
                icon={Building2} 
                label="Filiales" 
                value={stats.entreprises} 
                loading={loadingStats}
                color="emerald"
              />
              <StatCard 
                icon={Cpu} 
                label="Recrutements" 
                value={stats.contrats_actifs} 
                loading={loadingStats}
                color="amber"
                suffix="ok"
              />
            </motion.div>

            {/* Message de bas de page réactif */}
            <motion.div 
              variants={fadeInUp}
              className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-3"
            >
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Besoin de créer un nouvel espace entreprise ?
              </span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/create-entreprise" 
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-bold transition-all group"
                >
                  Inscrire mon entreprise 
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

          </motion.div>

        </motion.div>
      </div>

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
              <Link to="/offres" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Offres</Link>
              <Link to="/features" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Fonctionnalités</Link>
              <Link to="/register" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Inscription</Link>
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="flex items-center justify-around rounded-2xl border border-white/15 bg-slate-900/80 px-2 py-2 shadow-2xl backdrop-blur-xl">
          <Link to="/" aria-label="Accueil" className="rounded-xl p-3 text-primary-300 hover:bg-white/10"><Home className="h-5 w-5" /></Link>
          <Link to="/offres" aria-label="Offres" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Briefcase className="h-5 w-5" /></Link>
          <button aria-label="Ouvrir le menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="-mt-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white shadow-lg shadow-primary-500/40 ring-4 ring-slate-900/80">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
          </button>
          <Link to="/create-entreprise" aria-label="Créer une entreprise" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Building2 className="h-5 w-5" /></Link>
          <Link to="/register" aria-label="S'inscrire" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Users className="h-5 w-5" /></Link>
        </nav>
      </div>

      {/* Styles CSS supplémentaires */}
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