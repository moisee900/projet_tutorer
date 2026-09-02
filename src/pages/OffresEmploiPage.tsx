import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Briefcase, Search, MapPin, DollarSign, 
  Building2, Sun, Moon, Sparkles, Filter, AlertCircle,
  TrendingUp, Users, CheckCircle2, ArrowRight, Menu, X,
  Calendar, Shield, Zap, Star, Crown, MoreHorizontal, Home
} from 'lucide-react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { offreAPI, entrepriseAPI } from '../services/api'
import { BrandMark } from '../components/BrandMark'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

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

// Composant compteur animé
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

// Composant FeatureCard amélioré
const FeatureCard = ({ icon: Icon, title, desc, color, delay = 0 }: any) => {
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
      className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: isHovered ? ['-100%', '100%'] : '-100%',
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />
      
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700`}
      />

      <div className="relative z-10">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-xl mb-6`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

export const OffresEmploiPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [offres, setOffres] = useState<any[]>([])
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [statsOffres, setStatsOffres] = useState({
    totalActives: 0,
    entreprisesPartenaires: 0,
    salaireMoyen: 0,
    postulationsRapides: 98
  })
  const heroRef = useRef<HTMLDivElement>(null)

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

  // Chargement des données
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [offresResult, entreprisesResult] = await Promise.allSettled([
          offreAPI.getPubliees(),
          entrepriseAPI.getAll(),
        ])

        const offresResponse = offresResult.status === 'fulfilled' ? offresResult.value : null
        const entreprisesResponse = entreprisesResult.status === 'fulfilled' ? entreprisesResult.value : null

        const toArray = (response: any, key: string) => {
          if (Array.isArray(response)) return response
          if (Array.isArray(response?.[key])) return response[key]
          if (Array.isArray(response?.data)) return response.data
          return []
        }

        const rawOffres = toArray(offresResponse, 'offres')
        const rawEntreprises = toArray(entreprisesResponse, 'entreprises')
        
        setOffres(rawOffres)
        setEntreprises(rawEntreprises)

        const total = rawOffres.length
        const uniqueEntreprises = new Set(rawOffres.map((o: any) => o.id_entreprise)).size
        
        const salaires = rawOffres.map((o: any) => Number(o.salaire_base)).filter((s: number) => !isNaN(s) && s > 0)
        const moyenne = salaires.length > 0 ? Math.round(salaires.reduce((a: number, b: number) => a + b, 0) / salaires.length) : 0

        setStatsOffres({
          totalActives: total,
          entreprisesPartenaires: uniqueEntreprises || rawEntreprises.length,
          salaireMoyen: moyenne,
          postulationsRapides: 99
        })

      } catch (error) {
        console.error("Erreur de chargement", error)
        setOffres([])
        setEntreprises([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Filtrage intelligent
  const filteredOffres = offres.filter(offre => {
    const matchesSearch = 
      offre.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      offre.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offre.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || (offre.type_contrat && offre.type_contrat.toLowerCase() === filterType.toLowerCase())

    return matchesSearch && matchesType
  })

  const typesContrats = ['all', ...Array.from(new Set(offres.map(o => o.type_contrat).filter(Boolean)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <BrandMark subtitle="Recrutement & Carrière" />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/offres" className="text-primary-600 dark:text-primary-400 transition-colors">Offres d'emploi</Link>
              <Link to="/entreprises" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Entreprises</Link>
              <Link to="/conseils" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Conseils Carrière</Link>
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
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                  S'inscrire
                </Link>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 md:hidden rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                aria-label="Ouvrir le menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MENU MOBILE --- */}
        <AnimatePresence>
          {isMenuOpen && (
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
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Offres d'emploi
                  </Link>
                  <Link 
                    to="/entreprises" 
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Entreprises
                  </Link>
                  <Link 
                    to="/conseils" 
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Conseils Carrière
                  </Link>
                </nav>
                
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg shadow-lg"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- HERO SECTION AMÉLIORÉE --- */}
      <motion.section 
        ref={heroRef}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden py-20"
      >
        {/* Effet de fond animé */}
        <div className="absolute inset-0 overflow-hidden">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInDown}
              className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-primary-200 dark:border-primary-800 mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary-600" />
              </motion.div>
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                {filteredOffres.length} offres disponibles
              </span>
            </motion.div>

            <motion.h2 
              variants={fadeInLeft}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6"
            >
              Trouvez votre{' '}
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient bg-300">
                emploi de rêve
              </span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto"
            >
              Explorez les opportunités exclusives publiées par des entreprises en pleine croissance.
            </motion.p>

            {/* Barre de Recherche améliorée */}
            <motion.div 
              variants={fadeInUp}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un poste, un mot-clé ou une entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base"
                />
                <motion.div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                    Rechercher
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* --- STATISTIQUES AMÉLIORÉES --- */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {[
                { label: "Offres Actives", val: statsOffres.totalActives, icon: Briefcase, color: "from-primary-500 to-primary-600" },
                { label: "Entreprises", val: `${statsOffres.entreprisesPartenaires}+`, icon: Building2, color: "from-purple-500 to-purple-600" },
                { label: "Salaire Moyen", val: loading ? "..." : money.format(statsOffres.salaireMoyen), icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
                { label: "Candidatures simples", val: `${statsOffres.postulationsRapides}%`, icon: CheckCircle2, color: "from-amber-500 to-amber-600" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  custom={idx}
                  variants={fadeInUpStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 mx-auto mb-3`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">
                    {loading ? "..." : typeof stat.val === 'number' ? (
                      <AnimatedCounter target={stat.val} duration={2000} />
                    ) : stat.val}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* --- CORPS PRINCIPAL --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Barre de Filtres Dynamiques */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Filtrer par contrat :</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {typesContrats.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                {type === 'all' ? 'Tous les contrats' : type.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Titre dynamique */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {searchTerm || filterType !== 'all' ? 'Résultats de recherche' : 'Offres récentes'}
          </h3>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
            {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} trouvée{filteredOffres.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* --- GRID OFFRES AMÉLIORÉE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
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
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement des offres...</span>
          </div>
        ) : filteredOffres.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 max-w-sm mx-auto"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Aucun résultat</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Aucune offre ne correspond à vos critères de recherche.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSearchTerm(''); setFilterType('all'); }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
            >
              Réinitialiser les filtres
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredOffres.map((offre, index) => {
                const entreprise = entreprises.find(e => e.id_entreprise === offre.id_entreprise)
                const dateLimite = offre.date_limite ? new Date(offre.date_limite).toLocaleDateString('fr-FR') : "Non spécifiée"
                const salaireFormate = offre.salaire_base ? Number(offre.salaire_base).toLocaleString('fr-FR') : null

                return (
                  <motion.div
                    layout
                    variants={fadeInUpStagger}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    key={offre.id_offre}
                    className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Effet de brillance */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                        transition: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                          delay: index * 0.2
                        }
                      }}
                    />

                    {/* Glow au survol */}
                    <motion.div 
                      className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"
                    />

                    <div className="relative z-10">
                      {/* En-tête de carte */}
                      <div className="flex items-start justify-between mb-4">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-bold shadow-inner"
                        >
                          {entreprise?.nom ? (
                            <span className="text-lg font-extrabold">{entreprise.nom.charAt(0).toUpperCase()}</span>
                          ) : (
                            <Briefcase className="w-5 h-5" />
                          )}
                        </motion.div>
                        <div className="flex flex-col items-end space-y-1.5">
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold tracking-wide uppercase border border-emerald-200/30">
                            {offre.statut || "Actif"}
                          </span>
                          {offre.type_contrat && (
                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase border border-blue-200/30">
                              {offre.type_contrat}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Corps de carte */}
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-2">
                        {offre.titre}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                        {offre.description}
                      </p>

                      {/* Métadonnées */}
                      <div className="space-y-2.5 mb-6">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          {entreprise?.code_entreprise ? (
                            <Link to={`/entreprise/${entreprise.code_entreprise}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
                              {entreprise.nom}
                            </Link>
                          ) : (
                            <span>Entreprise non spécifiée</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{entreprise?.adresse || 'Télétravail / Distanciel'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {salaireFormate ? money.format(Number(offre.salaire_base)) : 'À négocier'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pied de carte */}
                    <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Expire le : {dateLimite}</span>
                      </span>
                      
                      <motion.div whileHover={{ x: 5 }}>
                        <Link 
                          to={`/offres/${offre.id_offre}`} 
                          className="px-3.5 py-2 bg-slate-100 hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 dark:bg-slate-800 dark:hover:bg-gradient-to-r dark:hover:from-primary-600 dark:hover:to-primary-500 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                        >
                          <span>Détails</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* --- SECTION FONCTIONNALITÉS --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-500 mx-auto rounded-full mb-6"
            />
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Pourquoi choisir{' '}
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient bg-300">
                RH Manager
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              La plateforme qui simplifie votre recherche d'emploi et accélère votre carrière.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Recherche rapide", desc: "Trouvez l'offre parfaite en quelques secondes grâce à notre moteur intelligent.", color: "from-primary-500 to-primary-600" },
              { icon: Shield, title: "Postulation sécurisée", desc: "Vos données sont protégées et vos candidatures restent confidentielles.", color: "from-purple-500 to-purple-600" },
              { icon: Star, title: "Suivi personnalisé", desc: "Recevez des recommandations et suivez l'avancement de vos candidatures.", color: "from-amber-500 to-amber-600" },
            ].map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                desc={feature.desc}
                color={feature.color}
                delay={index}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- SECTION CTA --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-gradient-to-br from-primary-50 via-purple-50 to-primary-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-primary-900/20 relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5"
          animate={pulseGlow}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 mb-6"
          >
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Prêt à décrocher l'emploi de vos rêves ?</span>
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4"
          >
            Rejoignez la communauté
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient bg-300">
              RH Manager
            </span>
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-slate-600 dark:text-slate-300 mb-8"
          >
            Des milliers de candidats vous ont déjà précédé. Créez votre compte et commencez votre recherche dès aujourd'hui.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
                <span>Créer mon compte</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login" className="inline-flex items-center justify-center px-10 py-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700 transition-all">
                <span>Se connecter</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-4 md:mb-0"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">RH Manager</span>
                <p className="text-xs text-slate-400">Recrutement & Carrière</p>
              </div>
            </motion.div>
            <div className="text-sm text-slate-400">© 2026 RH Manager. Tous droits réservés.</div>
          </div>
        </div>
      </footer>

      {/* Navigation mobile */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: .96 }}
              className="mb-3 flex justify-center gap-2 rounded-2xl bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl"
            >
              <Link to="/offres" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Offres</Link>
              <Link to="/entreprises" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Entreprises</Link>
              <Link to="/register" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Inscription</Link>
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="flex items-center justify-around rounded-2xl border border-white/15 bg-slate-900/80 px-2 py-2 shadow-2xl backdrop-blur-xl">
          <Link to="/" aria-label="Accueil" className="rounded-xl p-3 text-primary-300 hover:bg-white/10"><Home className="h-5 w-5" /></Link>
          <Link to="/offres" aria-label="Offres" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Briefcase className="h-5 w-5" /></Link>
          <button aria-label="Ouvrir le menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className="-mt-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white shadow-lg shadow-primary-500/40 ring-4 ring-slate-900/80">
            {isMenuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
          </button>
          <Link to="/entreprise/inscription" aria-label="Créer une entreprise" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Building2 className="h-5 w-5" /></Link>
          <Link to="/register" aria-label="Compte" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Users className="h-5 w-5" /></Link>
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