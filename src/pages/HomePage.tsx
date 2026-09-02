import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { PublicNavbar } from '../components/PublicNavbar'
import { Link } from 'react-router-dom'
import { 
  Building2, Users, Briefcase, ArrowRight, CheckCircle2, 
  Sparkles, Crown, Star, Zap, Shield, Calendar, MapPin,
  TrendingUp, Award, Clock,
  MoreHorizontal, Home, Menu,
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

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
  hidden: { opacity: 0, x: -80, rotate: -5 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 25,
      duration: 0.9
    }
  }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 80, rotate: 5 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 25,
      duration: 0.9
    }
  }
}

const fadeInDown = {
  hidden: { opacity: 0, y: -60, scale: 0.9 },
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

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
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
        const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
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

// Composant Card avec effet de profondeur
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
      {/* Effet de brillance */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: isHovered ? ['-100%', '100%'] : '-100%',
          transition: { duration: 0.8, ease: "easeInOut" }
        }}
      />
      
      {/* Glow effect */}
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

export const HomePage = () => {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    utilisateurs: 0,
    entreprises: 0,
    offres_actives: 0,
    contrats_actifs: 0,
    nouveaux_contrats: 0,
    graphique: {
      labels: Array(12).fill(''),
      hauteurs: Array(12).fill(0),
      valeurs: Array(12).fill(0)
    }
  })
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = API_BASE_URL

        const responseOffres = await fetch(`${apiBase}/offres-accueil`)
        const resultOffres = await responseOffres.json()
        if (resultOffres.success) {
          setOffres(resultOffres.data)
        }

        const responseStats = await fetch(`${apiBase}/stats-accueil`)
        const resultStats = await responseStats.json()
        if (resultStats.success) {
          setStats(resultStats.data)
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'accueil :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10 overflow-x-hidden">
      <PublicNavbar />

      {/* --- HERO SECTION --- */}
      <motion.section 
        ref={heroRef}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex items-center overflow-hidden pt-20"
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

        <motion.div 
          variants={containerVariants}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche - Texte */}
            <div className="text-center lg:text-left">
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
                <span className="text-sm font-bold text-primary-700 dark:text-primary-300">Nouvelle génération de gestion RH</span>
              </motion.div>

              <motion.h1 variants={fadeInLeft} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-slate-800 dark:text-white">Gérez votre</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient bg-300">entreprise</span>
                <br />
                <span className="text-slate-800 dark:text-white">intelligemment</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                La plateforme tout-en-un qui révolutionne la gestion des ressources humaines. Recrutement, contrats, paie, congés.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
                    <span>Démarrer maintenant</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/offres" className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-full shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700 transition-all">
                    <Briefcase className="mr-2 w-5 h-5" />
                    <span>Voir les offres</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Statistiques avec compteurs animés */}
              <motion.div 
                variants={fadeInUp}
                className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0"
              >
                {[
                  { icon: Users, label: 'Utilisateurs', value: stats.utilisateurs },
                  { icon: Building2, label: 'Entreprises', value: stats.entreprises },
                  { icon: Briefcase, label: 'Offres Actives', value: stats.offres_actives },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={fadeInUpStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="text-center lg:text-left group"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2 group-hover:text-primary-600 transition-colors" />
                    </motion.div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                      {loading ? "..." : <AnimatedCounter target={stat.value} duration={2000} />}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Colonne droite - Dashboard Preview */}
            <motion.div 
              variants={fadeInRight}
              className="relative hidden lg:block"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="dashboard-float relative p-6 sm:p-8 rounded-[2rem] bg-white/[0.16] dark:bg-slate-800/[0.16] backdrop-blur-[2px]"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-yellow-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-auto">Dashboard RH MANAGER</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Volume de recrutements (12 mois glissants)</div>
                    <motion.div 
                      className="text-2xl font-bold text-primary-600"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {loading ? "..." : `+${stats.nouveaux_contrats}`} ce mois
                    </motion.div>
                  </div>
                  
                  {/* Graphique artistique : grille lumineuse, aurore et barres */}
                  <div className="relative h-40 overflow-hidden rounded-2xl border border-primary-100/70 bg-transparent px-3 pt-4 shadow-inner dark:border-primary-900/40">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(168,85,247,.22),transparent_42%),radial-gradient(circle_at_20%_100%,rgba(14,165,233,.16),transparent_45%)]" />
                    {[0, 1, 2, 3].map((line) => (
                      <div key={line} className="pointer-events-none absolute left-3 right-3 border-t border-dashed border-slate-300/50 dark:border-slate-600/40" style={{ top: `${22 + line * 22}%` }} />
                    ))}
                    <div className="relative z-10 flex h-full items-end gap-1.5 sm:gap-2">
                      {stats.graphique.hauteurs.map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: `${Math.max(height, 7)}%`, opacity: 1 }}
                          transition={{ delay: i * 0.07, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                          className="group relative flex-1 cursor-pointer rounded-t-[0.65rem] bg-gradient-to-t from-primary-600 via-violet-500 to-fuchsia-400 shadow-[0_-4px_16px_rgba(139,92,246,.35)] transition-all duration-300 hover:brightness-125 hover:shadow-[0_-6px_24px_rgba(217,70,239,.55)]"
                        >
                          <motion.span className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/50" animate={{ opacity: [0.35, 0.8, 0.35] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.12 }} />
                          <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/20 bg-slate-950/95 px-3 py-2 text-[10px] font-semibold text-white shadow-2xl group-hover:block">
                            <span className="text-fuchsia-300">{stats.graphique.labels[i]}</span><br />{stats.graphique.valeurs[i]} recrutement(s)
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500 px-1">
                    {stats.graphique.labels.map((label, idx) => (
                      <span key={idx} className="w-full text-center truncate">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-6">
                    {[
                      { label: 'Contrats actifs', value: stats.contrats_actifs },
                      { label: 'Nouveaux ce mois', value: stats.nouveaux_contrats },
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="dashboard-stat-float py-3 px-1"
                      >
                        <div className="text-xs font-semibold text-primary-600 dark:text-primary-300">{item.label}</div>
                        <div className="text-2xl font-bold text-primary-700 dark:text-primary-200">
                          {loading ? "..." : <AnimatedCounter target={item.value} duration={1500} />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* --- SECTION DES OFFRES --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary-100/20 dark:bg-primary-950/10 rounded-full blur-3xl"
            animate={pulseGlow}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Dernières opportunités publiées
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Rejoignez l'une des entreprises partenaires de la plateforme RH Manager. Vos compétences méritent le meilleur cadre.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
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
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement des opportunités...</span>
            </div>
          ) : !offres || offres.length === 0 ? (
            <motion.div 
              variants={fadeInUp}
              className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 max-w-3xl mx-auto px-6"
            >
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Aucune offre d'emploi</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucune offre n'est disponible pour le moment. Revenez un peu plus tard !
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {offres.map((offre: any, index: number) => {
                const dateCreation = offre.created_at ? new Date(offre.created_at).toLocaleDateString('fr-FR') : "Récemment";
                const dateLimite = offre.date_limite ? new Date(offre.date_limite).toLocaleDateString('fr-FR') : "Non spécifiée";
                const salaireFormate = offre.salaire_base ? Number(offre.salaire_base).toLocaleString('fr-FR') : "À négocier";

                return (
                  <motion.div 
                    key={offre.id_offre}
                    variants={fadeInUpStagger}
                    custom={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
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

                    <div>
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <span className="inline-flex px-4 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full border border-primary-200/50 dark:border-primary-800/30">
                          {salaireFormate !== "À négocier" ? `${salaireFormate} €` : salaireFormate}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center shrink-0">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {dateCreation}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-3">
                        {offre.titre || "Titre non spécifié"}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-6">
                        {offre.description || "Aucune description fournie pour cette offre d'emploi."}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5 mt-auto flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">Limite : {dateLimite}</span>
                      </div>
                      
                      <motion.div whileHover={{ x: 5 }}>
                        <Link 
                          to={`/offres/${offre.id_offre}`} 
                          className="inline-flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                          <span>Voir l'offre</span>
                          <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <div className="text-center mt-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/offres" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-full shadow-lg hover:shadow-xl border-2 border-slate-200/80 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Parcourir toutes les offres</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* --- SECTION CREATION D'ENTREPRISE --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-gradient-to-br from-primary-50 via-orange-50 to-red-50 dark:from-primary-900/20 dark:via-orange-900/20 dark:to-red-900/20 relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-red-500/5"
          animate={pulseGlow}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 mb-6"
            >
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Devenez propriétaire d'entreprise</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Créez votre entreprise en
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-orange-600 to-red-600 bg-clip-text text-transparent bg-300 animate-gradient">quelques minutes</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Lancez votre entreprise et devenez automatiquement Directeur. Gérez votre équipe, publiez des offres d'emploi et développez votre activité.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Zap, title: "Création rapide", desc: "Formulaire simple et intuitif", color: "from-primary-500 to-primary-600" },
              { icon: Shield, title: "Sécurisé", desc: "Données protégées et chiffrées", color: "from-orange-500 to-red-500" },
              { icon: Star, title: "Support dédié", desc: "Accompagnement personnalisé", color: "from-red-500 to-primary-500" },
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

          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/entreprise/inscription" className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary-500 via-orange-50 to-red-500 hover:from-primary-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
                <Crown className="mr-3 w-6 h-6" />
                <span>Créer mon entreprise maintenant</span>
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Gratuit • Sans engagement • Configuration immédiate
            </p>
          </div>
        </div>
      </motion.section>

      {/* --- SECTION FONCTIONNALITÉS --- */}
      <motion.section 
        id="features" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-24 bg-white dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Toutes les fonctionnalités
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent bg-300 animate-gradient">dont vous avez besoin</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: "Recrutement", desc: "Publiez des offres, recevez les candidatures, planifiez des entretiens.", color: "from-primary-500 to-primary-600" },
              { icon: CheckCircle2, title: "Contrats", desc: "Créez, signez et archivez tous vos contrats avec renouvellement automatique.", color: "from-primary-500 to-primary-600" },
              { icon: Users, title: "Employés", desc: "Gestion complète des employés, services et postes de votre entreprise.", color: "from-secondary-500 to-primary-600" },
              { icon: Clock, title: "Présences", desc: "Suivi des arrivées et départs avec pointage et statistiques.", color: "from-primary-500 to-primary-600" },
              { icon: Award, title: "Avantages", desc: "Gestion des avantages sociaux et des récompenses pour vos employés.", color: "from-primary-500 to-primary-600" },
              { icon: TrendingUp, title: "Analyses", desc: "Tableaux de bord et statistiques pour piloter votre stratégie RH.", color: "from-primary-500 to-primary-600" },
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
                <p className="text-xs text-slate-400">Enterprise Suite</p>
              </div>
            </motion.div>
            <div className="text-sm text-slate-400">© 2026 RH Manager. Tous droits réservés.</div>
          </div>
        </div>
      </footer>

      {/* Navigation mobile façon application */}
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
          <button aria-label="Ouvrir le menu" onClick={() => setIsMobileMenuOpen(value => !value)} className="-mt-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white shadow-lg shadow-primary-500/40 ring-4 ring-slate-900/80">
            {isMobileMenuOpen ? <Menu className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
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
        .dashboard-float {
          animation: dashboardFloat 7s ease-in-out infinite;
        }
        .dashboard-stat-float {
          animation: statFloat 5s ease-in-out infinite;
          border-bottom: 1px solid rgba(139, 92, 246, .22);
        }
        .dashboard-stat-float:nth-child(2) { animation-delay: .7s; }
        @keyframes dashboardFloat { 0%,100% { transform: translateY(0) rotateX(0); } 50% { transform: translateY(-8px) rotateX(1deg); } }
        @keyframes statFloat { 0%,100% { transform: translateY(0); filter: drop-shadow(0 0 0 transparent); } 50% { transform: translateY(-4px); filter: drop-shadow(0 8px 14px rgba(124,58,237,.18)); } }
        @media (prefers-reduced-motion: reduce) { .dashboard-float, .dashboard-stat-float { animation: none; } }
      `}</style>
    </div>
  )
}