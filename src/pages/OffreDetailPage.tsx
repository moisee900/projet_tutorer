import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Briefcase, MapPin, DollarSign, Calendar, Building2, ArrowLeft, 
  FileText, X, Copy, LogIn, LoaderCircle, Mail, RefreshCw,
  Users, Clock, Award, Shield, Sparkles, CheckCircle2, Star,
  ArrowRight, Home, Menu, MoreHorizontal, TrendingUp, Eye, Sun, Moon
} from 'lucide-react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { offreAPI } from '../services/api'
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

type PublicCompany = {
  nom: string
  nom_commercial?: string | null
  description?: string | null
  created_at?: string | null
}

type PublicJobOffer = {
  titre: string
  description: string
  localisation: string
  salaire_base?: number | string | null
  date_limite?: string | null
  type_contrat?: string | null
  experience_requise?: string | null
  competences_requises?: string | null
  avantages?: string | null
  entreprise?: PublicCompany | null
}

// Composant Badge avec animation
const Badge = ({ icon: Icon, label, color = "primary" }: { icon: any, label: string, color?: string }) => {
  const colors = {
    primary: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
  }

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${colors[color as keyof typeof colors] || colors.primary}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </motion.span>
  )
}

// Composant InfoCard
const InfoCard = ({ icon: Icon, title, children, className = "" }: any) => (
  <motion.div 
    variants={fadeInUp}
    className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 ${className}`}
  >
    <div className="flex items-center space-x-3 mb-4">
      <motion.div 
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20"
      >
        <Icon className="w-5 h-5 text-white" />
      </motion.div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
)

export const OffreDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showPostulationModal, setShowPostulationModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cv: null as File | null,
    lettre_motivation: '',
  })

  const [offre, setOffre] = useState<PublicJobOffer | null>(null)
  const [entreprise, setEntreprise] = useState<PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionStartedAt, setSubmissionStartedAt] = useState<number | null>(null)
  const [applicationFeedback, setApplicationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [candidateAccount, setCandidateAccount] = useState<{ email: string; temporary_password: string | null; is_new: boolean; mail_send_url?: string | null } | null>(null)
  const [mailStatus, setMailStatus] = useState<'idle' | 'pending' | 'sent' | 'failed'>('idle')
  const welcomeEmailsInProgress = useRef(new Set<string>())
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

  useEffect(() => {
    const load = async () => {
      try {
        const offreResponse = await offreAPI.getById(parseInt(id || '0'))
        const currentOffre = (offreResponse.offre || offreResponse) as PublicJobOffer
        setOffre(currentOffre)
        setEntreprise(currentOffre.entreprise || null)
      } catch {
        setOffre(null)
        setEntreprise(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const sendWelcomeEmail = async (account = candidateAccount, retry = false) => {
    if (!account?.mail_send_url || !account.temporary_password) return
    const key = account.mail_send_url
    if (!retry && welcomeEmailsInProgress.current.has(key)) return

    welcomeEmailsInProgress.current.add(key)
    setMailStatus('pending')
    try {
      await offreAPI.sendCandidateWelcomeEmail(key, account.temporary_password)
      setMailStatus('sent')
    } catch {
      welcomeEmailsInProgress.current.delete(key)
      setMailStatus('failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 grid place-items-center">
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
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement de l'offre...</span>
        </div>
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div 
            animate={floatAnimation}
            className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Briefcase className="w-12 h-12 text-slate-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Offre non trouvée</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">L'offre d'emploi que vous recherchez n'existe pas ou a été supprimée.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/offres" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux offres
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setSubmissionStartedAt(Date.now())
    setApplicationFeedback(null)
    try {
      const candidatureData = new FormData()
      candidatureData.append('nom', formData.nom)
      candidatureData.append('post_nom', formData.post_nom)
      candidatureData.append('prenom', formData.prenom)
      candidatureData.append('email', formData.email)
      candidatureData.append('telephone', formData.telephone)
      candidatureData.append('lettre_motivation', formData.lettre_motivation)

      if (formData.cv) {
        candidatureData.append('cv', formData.cv)
      }

      const response = await offreAPI.postuler(Number(id), candidatureData)
      setApplicationFeedback({ type: 'success', message: response.message || 'Votre candidature a été enregistrée. L\'entreprise examinera votre dossier.' })
      setShowPostulationModal(false)
      setCandidateAccount(response.account || null)
      setMailStatus(response.account?.is_new ? 'pending' : 'idle')
      if (response.account?.is_new && response.account?.mail_send_url) {
        setTimeout(() => void sendWelcomeEmail(response.account), 0)
      }
      if (response.account?.token && response.account?.user) {
        localStorage.setItem('auth_token', response.account.token)
        localStorage.setItem('token', response.account.token)
        localStorage.setItem('user', JSON.stringify(response.account.user))
        window.dispatchEvent(new Event('rh-auth-changed'))
      }
      setFormData({ nom: '', post_nom: '', prenom: '', email: '', telephone: '', cv: null, lettre_motivation: '' })
    } catch (error) {
      setApplicationFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'La candidature n\'a pas pu être envoyée. Vérifiez les informations saisies et réessayez.',
      })
    } finally {
      setSubmitting(false)
      setSubmissionStartedAt(null)
    }
  }

  const copyCredential = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  const getContratColor = (type: string) => {
    const types: Record<string, string> = {
      'cdi': 'emerald',
      'cdd': 'amber',
      'stage': 'purple',
      'alternance': 'blue',
      'freelance': 'primary'
    }
    return types[type?.toLowerCase()] || 'primary'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <BrandMark subtitle="Détail de l'offre" />
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
                    className="py-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Offres d'emploi
                  </Link>
                  <Link 
                    to="/entreprises" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Entreprises
                  </Link>
                  <Link 
                    to="/conseils" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Conseils Carrière
                  </Link>
                </nav>
                
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
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
        className="relative overflow-hidden py-16"
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
            className="flex flex-col lg:flex-row items-start gap-8"
          >
            {/* Logo entreprise animé */}
            <motion.div 
              variants={fadeInLeft}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative"
            >
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <span className="text-4xl lg:text-5xl font-extrabold text-white">
                  {entreprise?.nom?.charAt(0).toUpperCase() || 'E'}
                </span>
              </div>
              <motion.div 
                className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            {/* Infos principales */}
            <motion.div 
              variants={fadeInRight}
              className="flex-1"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge icon={Briefcase} label={offre.type_contrat || 'Contrat'} color={getContratColor(offre.type_contrat || '')} />
                <Badge icon={Clock} label="Urgent" color="amber" />
                <motion.span 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Nouveau</span>
                </motion.span>
              </div>

              <motion.h1 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white mb-3"
              >
                {offre.titre}
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-4"
              >
                {entreprise?.nom || 'Entreprise partenaire'}
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-6 text-slate-600 dark:text-slate-400"
              >
                <motion.span 
                  whileHover={{ x: 3 }}
                  className="flex items-center space-x-2"
                >
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span>{offre.localisation}</span>
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2"
                >
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {offre.salaire_base !== null && offre.salaire_base !== undefined 
                      ? money.format(Number(offre.salaire_base))
                      : 'À négocier'}
                  </span>
                </motion.span>
                <motion.span 
                  whileHover={{ x: -3 }}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>Limite: {offre.date_limite || 'Non précisée'}</span>
                </motion.span>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-6 flex flex-wrap gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setShowPostulationModal(true)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
                  >
                    <span>Postuler maintenant</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/offres" 
                    className="inline-flex items-center px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-full shadow-lg border-2 border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Retour
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* --- CONTENU PRINCIPAL --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Feedback de candidature amélioré */}
        <AnimatePresence>
          {applicationFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 rounded-2xl border p-6 shadow-xl backdrop-blur-2xl ${
                applicationFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200' 
                  : 'bg-red-500/10 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200'
              }`}
              role="status"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {applicationFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5" />
                  ) : (
                    <X className="w-6 h-6 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-lg">
                      {applicationFeedback.type === 'success' ? '✅ Candidature enregistrée' : '❌ Envoi impossible'}
                    </p>
                    <p className="mt-1 text-sm">{applicationFeedback.message}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setApplicationFeedback(null)} 
                  className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
                  aria-label="Fermer le message"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compte candidat créé */}
        <AnimatePresence>
          {candidateAccount && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 border border-teal-200 bg-white dark:border-teal-800 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-bold">Votre espace candidat est prêt 🎉</h2>
                    <p className="mt-1 text-sm text-teal-50">Conservez vos identifiants avant de consulter le suivi.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</p>
                      <p className="truncate font-mono text-sm text-slate-900 dark:text-white">{candidateAccount.email}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => copyCredential(candidateAccount.email)} 
                      className="p-2 text-slate-600 hover:text-teal-700 transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg"
                      title="Copier l'e-mail"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  {candidateAccount.temporary_password && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mot de passe temporaire</p>
                        <p className="break-all font-mono text-sm text-slate-900 dark:text-white">{candidateAccount.temporary_password}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => copyCredential(candidateAccount.temporary_password || '')} 
                        className="p-2 text-slate-600 hover:text-teal-700 transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg"
                        title="Copier le mot de passe"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {candidateAccount.is_new && (
                  <div className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
                    mailStatus === 'failed' 
                      ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
                      : mailStatus === 'sent'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
                      : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mailStatus === 'pending' ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                    <span>
                      {mailStatus === 'sent' && '✅ Identifiants envoyés par e-mail.'}
                      {mailStatus === 'failed' && '⚠️ Échec de l\'e-mail. Vos accès restent valides.'}
                      {mailStatus === 'pending' && '📧 Envoi de l\'e-mail de bienvenue...'}
                      {mailStatus === 'idle' && '📧 Préparation de l\'e-mail...'}
                    </span>
                  </div>
                  {mailStatus === 'failed' && (
                    <button 
                      type="button" 
                      onClick={() => void sendWelcomeEmail(candidateAccount, true)} 
                      className="shrink-0 rounded-lg p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      title="Renvoyer l'e-mail"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button 
                    type="button" 
                    onClick={() => navigate(candidateAccount.is_new ? '/dashboard/utilisateur' : '/login')} 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 font-bold text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
                  >
                    <LogIn className="h-5 w-5" />
                    {candidateAccount.is_new ? '📊 Consulter le suivi' : '🔐 Se connecter à mon espace'}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <InfoCard icon={FileText} title="Description du poste">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {offre.description}
              </p>
            </InfoCard>

            {/* Profil recherché */}
            <InfoCard icon={Users} title="Profil recherché">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>Expérience requise</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    {offre.experience_requise || 'Non précisée'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Compétences attendues</span>
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {offre.competences_requises || 'Non précisées'}
                    </p>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Avantages */}
            <InfoCard icon={Award} title="Avantages">
              <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {offre.avantages || 'Aucun avantage précisé.'}
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Processus de recrutement */}
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/50 shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Processus de recrutement</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { step: 1, label: "Soumission de votre candidature", icon: FileText },
                  { step: 2, label: "Examen de votre profil", icon: Users },
                  { step: 3, label: "Entretien téléphonique ou visio", icon: Clock },
                  { step: 4, label: "Entretien technique", icon: Award },
                  { step: 5, label: "Décision finale et offre", icon: CheckCircle2 },
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    whileHover={{ scale: 1.02, x: 3 }}
                    className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-amber-200/50 dark:border-amber-800/30"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                      {item.step}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Carte entreprise */}
            <motion.div 
              variants={fadeInRight}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 sticky top-24"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                <span>Entreprise</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <span className="text-2xl font-extrabold text-white">
                      {entreprise?.nom?.charAt(0).toUpperCase() || 'E'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{entreprise?.nom || 'Entreprise partenaire'}</p>
                    {entreprise?.nom_commercial && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{entreprise.nom_commercial}</p>
                    )}
                  </div>
                </div>

                {entreprise?.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {entreprise.description}
                  </p>
                )}

                <div className="space-y-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span className="font-semibold">{offre.type_contrat || 'Non précisé'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span>{offre.localisation}</span>
                  </div>
                  {entreprise?.created_at && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span>Créée le {entreprise.created_at}</span>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <button
                  onClick={() => setShowPostulationModal(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                >
                  Postuler maintenant
                </button>
              </motion.div>
            </motion.div>

            {/* Informations essentielles */}
            <motion.div 
              variants={fadeInRight}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-primary-500" />
                <span>Informations essentielles</span>
              </h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                  <dt className="text-slate-500 dark:text-slate-400">Type de contrat</dt>
                  <dd className="font-semibold text-slate-800 dark:text-white">{offre.type_contrat || 'Non précisé'}</dd>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                  <dt className="text-slate-500 dark:text-slate-400">Lieu de travail</dt>
                  <dd className="font-semibold text-slate-800 dark:text-white">{offre.localisation || 'Non précisé'}</dd>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                  <dt className="text-slate-500 dark:text-slate-400">Rémunération</dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {offre.salaire_base !== null && offre.salaire_base !== undefined 
                      ? money.format(Number(offre.salaire_base))
                      : 'À négocier'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500 dark:text-slate-400">Date limite</dt>
                  <dd className="font-semibold text-amber-600 dark:text-amber-400">{offre.date_limite || 'Non précisée'}</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800 mt-20">
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
          {isMobileMenuOpen && (
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
          <button aria-label="Ouvrir le menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="-mt-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white shadow-lg shadow-primary-500/40 ring-4 ring-slate-900/80">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
          </button>
          <Link to="/entreprise/inscription" aria-label="Créer une entreprise" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Building2 className="h-5 w-5" /></Link>
          <Link to="/register" aria-label="Compte" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><Users className="h-5 w-5" /></Link>
        </nav>
      </div>

      {/* --- MODAL DE POSTULATION AMÉLIORÉE --- */}
      <AnimatePresence>
        {showPostulationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPostulationModal(false)
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header modal */}
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Postuler à cette offre</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remplissez le formulaire ci-dessous</p>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPostulationModal(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Résumé de l'offre */}
                <div className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl border border-primary-200 dark:border-primary-800/50">
                  <p className="font-bold text-primary-800 dark:text-primary-200">{offre.titre}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-300">{entreprise?.nom || 'Entreprise partenaire'}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className="flex items-center space-x-1 text-primary-600 dark:text-primary-300">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{offre.localisation}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-300">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{offre.salaire_base ? money.format(Number(offre.salaire_base)) : 'À négocier'}</span>
                    </span>
                  </div>
                </div>

                {/* Champs du formulaire */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.nom} 
                      onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Post-nom</label>
                    <input 
                      type="text" 
                      value={formData.post_nom} 
                      onChange={(e) => setFormData({...formData, post_nom: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      placeholder="Votre post-nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.prenom} 
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      value={formData.telephone} 
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      CV (PDF) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setFormData({...formData, cv: e.target.files?.[0] || null})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300" 
                        required 
                      />
                      {formData.cv && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded"
                        >
                          {formData.cv.name}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Lettre de motivation <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={formData.lettre_motivation} 
                      onChange={(e) => setFormData({...formData, lettre_motivation: e.target.value})} 
                      rows={6} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" 
                      placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..." 
                      required 
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPostulationModal(false)} 
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold"
                  >
                    Annuler
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    disabled={submitting} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        <span>Envoi en cours...</span>
                      </span>
                    ) : (
                      '📤 Envoyer ma candidature'
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
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient { animation: none; }
        }
      `}</style>
    </div>
  )
}