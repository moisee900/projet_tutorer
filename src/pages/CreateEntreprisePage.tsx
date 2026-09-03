import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, Mail, Lock, Eye, EyeOff, Phone, MapPin, 
  Crown, Upload, X, Sun, Moon, Home, Menu, MoreHorizontal, 
  Briefcase, User, CheckCircle2, Info, AlertCircle, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { entrepriseAPI } from '../services/api'
import { BrandMark } from '../components/BrandMark'
import { Toast } from '../components/ui/Toast'

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
      type: "spring" as const,
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
      type: "spring" as const,
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
      type: "spring" as const,
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
      type: "spring" as const,
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
    ease: "easeInOut" as const
  }
}

// Composant StepIndicator
const StepIndicator = ({ step, label, active }: { step: number, label: string, active: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: step * 0.1 }}
    className={`flex items-center space-x-3 ${!active && 'opacity-40'}`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
      active 
        ? 'bg-gradient-to-r from-warm-600 to-warm-500 text-white shadow-lg shadow-warm-500/30' 
        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
    }`}>
      {step}
    </div>
    <span className={`text-sm font-semibold ${active ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
      {label}
    </span>
  </motion.div>
)

export const CreateEntreprisePage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    nom_commercial: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
    password: '',
    password_confirmation: '',
  })
  const [photos, setPhotos] = useState({
    profil: null as File | null,
    couverture: null as File | null,
    previewProfil: '',
    previewCouverture: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValidationErrors(prev => ({ ...prev, [name]: [] }))
    setFormData({ ...formData, [name]: value })
  }

  const handlePhotoChange = (type: 'profil' | 'couverture', file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos(prev => ({
          ...prev,
          [type]: file,
          [type === 'profil' ? 'previewProfil' : 'previewCouverture']: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = (type: 'profil' | 'couverture') => {
    setPhotos(prev => ({ 
      ...prev, 
      [type]: null, 
      [type === 'profil' ? 'previewProfil' : 'previewCouverture']: '' 
    }))
  }

  const getFieldError = (field: string) => {
    return validationErrors[field]?.[0] || null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setValidationErrors({})

    // Validation côté client
    const errors: Record<string, string[]> = {}
    if (!formData.nom.trim()) errors.nom = ['Le nom de l\'entreprise est requis']
    if (!formData.email.trim()) errors.email = ['L\'email est requis']
    if (!formData.telephone.trim()) errors.telephone = ['Le téléphone est requis']
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

    setLoading(true)
    setToast({ type: 'info', message: 'Création de l\'entreprise en cours...' })

    const dataToSend = new FormData()
    dataToSend.append('nom', formData.nom)
    if (formData.nom_commercial) dataToSend.append('nom_commercial', formData.nom_commercial)
    dataToSend.append('email', formData.email)
    dataToSend.append('telephone', formData.telephone)
    if (formData.adresse) dataToSend.append('adresse', formData.adresse)
    if (formData.description) dataToSend.append('description', formData.description)
    dataToSend.append('password', formData.password)

    if (photos.profil) dataToSend.append('photo_profil', photos.profil)
    if (photos.couverture) dataToSend.append('photo_couverture', photos.couverture)

    try {
      const response = await entrepriseAPI.create(dataToSend)
      
      // Gestion des erreurs de validation du backend
      if (response.errors) {
        setValidationErrors(response.errors)
        const errorMessages = Object.values(response.errors).flat().join(' · ')
        setToast({ type: 'error', message: errorMessages || 'Erreur de validation' })
        setLoading(false)
        return
      }

      if (response.success === false) {
        setToast({ type: 'error', message: response.message || 'Erreur lors de la création' })
        setLoading(false)
        return
      }

      // Succès - Mise à jour de l'utilisateur
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      const entrepriseId = response.entreprise?.id_entreprise ?? response.id_entreprise ?? response.entreprise?.id
      
      const linkedUser = {
        ...storedUser,
        ...(response.user ?? {}),
        role: 'directeur',
        id_entreprise: entrepriseId ?? storedUser.id_entreprise ?? null,
      }

      localStorage.setItem('user', JSON.stringify(linkedUser))
      
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('auth_token', response.token)
      }

      setSuccess('Entreprise créée avec succès !')
      setToast({ type: 'success', message: 'Entreprise créée avec succès ! Redirection...' })
      
      setTimeout(() => {
        navigate('/dashboard/directeur', { replace: true })
      }, 1500)

    } catch (err: any) {
      console.error('❌ Erreur création entreprise :', err)
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors)
        const errorMessages = Object.values(err.response.data.errors).flat().join(' · ')
        setToast({ type: 'error', message: errorMessages || 'Erreur de validation' })
      } else if (err.response?.data?.message) {
        setToast({ type: 'error', message: err.response.data.message })
      } else {
        setToast({ type: 'error', message: err.message || 'Erreur lors de la création de l\'entreprise' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warm-50/30 to-warm-50/30 dark:from-slate-900 dark:via-warm-900/10 dark:to-warm-900/10 overflow-x-hidden transition-colors duration-300">
      
      {/* Éléments d'ambiance en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-warm-200/30 dark:bg-warm-900/20 rounded-full blur-3xl"
          animate={pulseGlow}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-warm-200/30 dark:bg-warm-900/20 rounded-full blur-3xl"
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
              <BrandMark subtitle="Création d'entreprise" />
            </Link>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/offres" className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors">Offres d'emploi</Link>
              <Link to="/features" className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors">Fonctionnalités</Link>
              <Link to="/login" className="hover:text-warm-600 dark:hover:text-warm-400 transition-colors">Se connecter</Link>
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
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-warm-600 dark:hover:text-warm-400 transition-colors">
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
                  <Link to="/offres" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 hover:text-warm-600 dark:hover:text-warm-400 border-b border-slate-100 dark:border-slate-800/50">
                    Offres d'emploi
                  </Link>
                  <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 hover:text-warm-600 dark:hover:text-warm-400 border-b border-slate-100 dark:border-slate-800/50">
                    Fonctionnalités
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-warm-600 dark:text-warm-400 border-b border-slate-100 dark:border-slate-800/50">
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
          {/* En-tête */}
          <motion.div 
            variants={fadeInDown}
            className="text-center mb-8"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-warm-600 via-amber-600 to-warm-500 rounded-2xl shadow-2xl shadow-warm-500/30 mb-4 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="w-10 h-10 text-white transform group-hover:scale-110 transition-transform duration-300" />
              </motion.div>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2">
              Créer votre entreprise
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Lancez votre activité et devenez Directeur Général
            </p>
          </motion.div>

          {/* Indicateurs d'étapes */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-6 mb-8"
          >
            <StepIndicator step={1} label="Informations" active={true} />
            <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
            <StepIndicator step={2} label="Configuration" active={false} />
            <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
            <StepIndicator step={3} label="Validation" active={false} />
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-700/60"
          >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Message d'information */}
            <div className="mb-6 p-4 bg-gradient-to-r from-warm-50 to-amber-50 dark:from-warm-900/20 dark:to-amber-900/20 border border-warm-200 dark:border-warm-800/50 rounded-xl flex items-start space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Info className="w-5 h-5 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div className="text-sm text-warm-800 dark:text-warm-200">
                <strong>Créez votre entreprise en quelques minutes</strong>
                <p className="mt-1">Remplissez les informations ci-dessous pour lancer votre structure sur RH Manager.</p>
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
              {/* Photos de l'entreprise (optionnel) */}
              {/* <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Photos de l'entreprise <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(optionnel)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {photos.previewProfil ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-warm-500">
                        <img src={photos.previewProfil} alt="Preview Logo" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removePhoto('profil')} 
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <motion.label 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-warm-500 transition-colors bg-slate-50 dark:bg-slate-700/50"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Logo</span>
                        <span className="text-xs text-slate-500 mt-1">Max 2MB</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoChange('profil', e.target.files?.[0] || null)} 
                          className="hidden" 
                        />
                      </motion.label>
                    )}
                  </div>
                  <div>
                    {photos.previewCouverture ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-primary-500">
                        <img src={photos.previewCouverture} alt="Preview Couverture" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removePhoto('couverture')} 
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <motion.label 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-primary-500 transition-colors bg-slate-50 dark:bg-slate-700/50"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Couverture</span>
                        <span className="text-xs text-slate-500 mt-1">Max 5MB</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoChange('couverture', e.target.files?.[0] || null)} 
                          className="hidden" 
                        />
                      </motion.label>
                    )}
                  </div>
                </div>
              </div> */}

              {/* Nom de l'entreprise */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('nom') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="Ex: VitaService SARL" 
                    required 
                    maxLength={50} 
                  />
                  {getFieldError('nom') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('nom')}</p>
                  )}
                </div>
              </div>

              {/* Nom commercial */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nom commercial <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(optionnel)</span>
                </label>
                <input 
                  type="text" 
                  name="nom_commercial" 
                  value={formData.nom_commercial} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all" 
                  placeholder="Nom commercial alternative (Ex: Vita)" 
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email professionnel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                      getFieldError('email') 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="contact@entreprise.com" 
                    required 
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
                  )}
                </div>
              </div>

              {/* Téléphone */}
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
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
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

              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Adresse <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="adresse" 
                    value={formData.adresse} 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all" 
                    placeholder="Siège physique de l'entreprise" 
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(optionnel)</span>
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none transition-all" 
                  placeholder="Décrivez brièvement votre secteur d'activité..." 
                />
              </div>

              {/* Mots de passe */}
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
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-warm-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all ${
                        getFieldError('password_confirmation') 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Confirmez le mot de passe" 
                      required 
                      minLength={6} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {getFieldError('password_confirmation') && (
                      <p className="mt-1 text-xs text-red-500">{getFieldError('password_confirmation')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-warm-600 via-amber-600 to-warm-500 hover:from-warm-700 hover:via-amber-700 hover:to-warm-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Créer mon entreprise</span>
                  </>
                )}
              </motion.button>
            </form>

            <motion.div 
              variants={fadeInUp}
              className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400"
            >
              Déjà un compte ?{' '}
              <Link to="/login" className="text-warm-600 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 font-bold transition-colors">
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
          <Link to="/register" aria-label="Inscription" className="rounded-xl p-3 text-slate-300 hover:bg-white/10"><User className="h-5 w-5" /></Link>
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