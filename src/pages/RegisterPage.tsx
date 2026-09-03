import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, MapPin, 
  Crown, AlertCircle, CheckCircle2, Info, Loader2, 
  Sun, Moon, Building2, Briefcase, Home, Menu, MoreHorizontal, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../services/authService'
import { Toast } from '../components/ui/Toast'
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
      type: "spring" as const, // ✅ CORRIGÉ : ajout de "as const"
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
      type: "spring" as const, // ✅ CORRIGÉ : ajout de "as const"
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
}

const pulseGlow = {
  scale: [1, 1.02, 1],
  opacity: [0.6, 0.8, 0.6],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
}

// Composant RoleCard
const RoleCard = ({ icon: Icon, title, description, value, selected, onChange, color = "primary" }: any) => {
  const colors = {
    primary: "border-primary-500 bg-primary-50 dark:bg-primary-900/20",
    warm: "border-warm-500 bg-warm-50 dark:bg-warm-900/20"
  }

  return (
    <motion.label 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
        selected ? colors[color] : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      <input type="radio" name="role" value={value} checked={selected} onChange={onChange} className="sr-only" />
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
          selected 
            ? `bg-gradient-to-br from-${color === 'primary' ? 'primary' : 'warm'}-500 to-${color === 'primary' ? 'primary' : 'warm'}-600 shadow-lg shadow-${color === 'primary' ? 'primary' : 'warm'}-500/30` 
            : 'bg-slate-200 dark:bg-slate-700'
        }`}>
          <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
        </div>
        <div>
          <p className={`font-bold ${selected ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {selected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.label>
  )
}

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    role: 'utilisateur'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const navigate = useNavigate()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'role' && value === 'directeur') {
      setFormData({ ...formData, [name]: value })
      navigate('/create-entreprise')
      return
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: [] }))
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation côté client
    const errors: Record<string, string[]> = {}
    if (!formData.nom.trim()) errors.nom = ['Le nom est requis']
    if (!formData.prenom.trim()) errors.prenom = ['Le prénom est requis']
    if (!formData.email.trim()) errors.email = ['L\'email est requis']
    if (!formData.telephone.trim()) errors.telephone = ['Le téléphone est requis']
    if (!formData.adresse.trim()) errors.adresse = ['L\'adresse est requise']
    if (!formData.password) errors.password = ['Le mot de passe est requis']
    if (formData.password.length < 6) errors.password = ['Le mot de passe doit contenir au moins 6 caractères']
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = ['Les mots de passe ne correspondent pas']
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setToast({ type: 'error', message: 'Veuillez corriger les erreurs du formulaire' })
      return
    }

    if (loading) return

    setError('')
    setSuccess('')
    setValidationErrors({})
    setLoading(true)
    setToast({ type: 'info', message: 'Inscription en cours...' })

    try {
      const registrationData = {
        nom: formData.nom.trim(),
        post_nom: formData.post_nom.trim() || null,
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.trim(),
        adresse: formData.adresse.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role
      }

      console.log('📝 Données d\'inscription envoyées :', registrationData)

      const result = await authService.register(registrationData)

      console.log('📥 Réponse du serveur :', result)

      // ✅ Vérifier les erreurs de validation
      if (result.errors) {
        setValidationErrors(result.errors)
        const errorMessages = Object.values(result.errors).flat().join(' · ')
        setToast({ type: 'error', message: errorMessages || 'Erreur de validation' })
        setLoading(false)
        return
      }

      // ✅ Vérifier si l'inscription a échoué
      if (result.success === false) {
        setToast({ type: 'error', message: result.message || 'Erreur lors de l\'inscription' })
        setError(result.message || '')
        setLoading(false)
        return
      }

      // ✅ Succès - Stockage des tokens déjà fait par authService
      if (result.success === true && result.user) {
        const redirectPath = '/dashboards/utilisateur'

        setSuccess('Inscription réussie !')
        setToast({ type: 'success', message: 'Compte créé avec succès ! Redirection...' })

        console.log('🔄 Redirection vers :', redirectPath)
        console.log('👤 Utilisateur connecté :', result.user)
        console.log('🔑 Token :', result.token)

        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 1500)
        return
      }

      // ❌ Cas inattendu : redirection vers le dashboard utilisateur
      const redirectPath = '/dashboards/utilisateur'
      setSuccess('Inscription réussie !')
      setToast({ type: 'success', message: 'Compte créé avec succès ! Redirection...' })
      setTimeout(() => {
        navigate(redirectPath, { replace: true })
      }, 1500)
      return

    } catch (err: any) {
      console.error('❌ Erreur d\'inscription :', err)
      const redirectPath = '/dashboards/utilisateur'

      // ✅ Vérifier si l'erreur est un timeout mais l'utilisateur est peut-être créé
      if (err.message && err.message.includes('temps')) {
        const user = authService.getCurrentUser()
        if (user) {
          setSuccess('Inscription réussie !')
          setToast({ type: 'success', message: 'Compte créé avec succès ! Redirection...' })
          setTimeout(() => {
            navigate(redirectPath, { replace: true })
          }, 1500)
          return
        }
      }
      
      setToast({ type: 'error', message: err.message || 'Une erreur est survenue' })
      setError(err.message || '')
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field: string) => {
    return validationErrors[field]?.[0] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden transition-colors duration-300">
      
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

      <header className="z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <BrandMark subtitle="Création de compte" />
            </Link>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/offres" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Offres d'emploi</Link>
              <Link to="/features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Fonctionnalités</Link>
              <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Se connecter</Link>
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
                <nav className="flex flex-col space-y-3 font-medium">
                  <Link to="/offres" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Offres d'emploi
                  </Link>
                  <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Fonctionnalités
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800/50">
                    Se connecter
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div ref={heroRef} className="relative z-10 pt-24 pb-12 px-4 min-h-[calc(100vh-80px)] flex items-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto w-full"
        >
          <motion.div 
            variants={fadeInDown}
            className="text-center mb-8"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-500 rounded-2xl shadow-2xl shadow-primary-500/30 mb-4 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <UserPlus className="w-10 h-10 text-white transform group-hover:scale-110 transition-transform duration-300" />
              </motion.div>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Rejoignez RH Manager en quelques étapes
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-700/60"
          >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800/50 rounded-xl flex items-start space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div className="text-sm text-primary-800 dark:text-primary-200">
                <strong>Choisissez votre type de compte :</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Utilisateur</strong> : Pour postuler aux offres d'emploi</li>
                  <li><strong>Directeur</strong> : Pour créer et gérer votre entreprise</li>
                </ul>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-start space-x-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Type de compte <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <RoleCard
                    icon={User}
                    title="Utilisateur"
                    description="Postuler aux offres d'emploi"
                    value="utilisateur"
                    selected={formData.role === 'utilisateur'}
                    onChange={handleChange}
                    color="primary"
                  />
                  <RoleCard
                    icon={Crown}
                    title="Directeur"
                    description="Créer et gérer une entreprise"
                    value="directeur"
                    selected={formData.role === 'directeur'}
                    onChange={handleChange}
                    color="warm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      name="nom" 
                      value={formData.nom} 
                      onChange={handleChange} 
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                        getFieldError('nom') 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Votre nom" 
                      required 
                    />
                    {getFieldError('nom') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('nom')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Post-nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      name="post_nom" 
                      value={formData.post_nom} 
                      onChange={handleChange} 
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                        getFieldError('post_nom') 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Post-nom (optionnel)" 
                    />
                    {getFieldError('post_nom') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('post_nom')}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="prenom" 
                    value={formData.prenom} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('prenom') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Votre prénom" 
                    required 
                  />
                  {getFieldError('prenom') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('prenom')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('email') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="votre@email.com" 
                    required 
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    name="telephone" 
                    value={formData.telephone} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('telephone') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="+243 ..." 
                    required 
                  />
                  {getFieldError('telephone') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('telephone')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="adresse" 
                    value={formData.adresse} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('adresse') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Votre adresse" 
                    required 
                  />
                  {getFieldError('adresse') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('adresse')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                        getFieldError('password') 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Min. 6 caractères" 
                      required 
                      minLength={6} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {getFieldError('password') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirmer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      name="password_confirmation" 
                      value={formData.password_confirmation} 
                      onChange={handleChange} 
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                        getFieldError('password_confirmation') 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Confirmez" 
                      required 
                      minLength={6} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {getFieldError('password_confirmation') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('password_confirmation')}</p>
                    )}
                  </div>
                </div>
              </div>

              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-500 hover:from-primary-700 hover:via-purple-700 hover:to-primary-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                <span>{loading ? 'Inscription en cours...' : 'Créer mon compte'}</span>
              </motion.button>
            </form>

            <motion.div 
              variants={fadeInUp}
              className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400"
            >
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                Se connecter
              </Link>
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
              <Link to="/login" className="rounded-xl px-4 py-3 text-xs font-semibold text-white hover:bg-white/10">Connexion</Link>
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
          <Link to="/login" aria-label="Connexion" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><User className="h-5 w-5" /></Link>
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