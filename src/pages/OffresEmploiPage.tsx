import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Briefcase, Search, MapPin, DollarSign, Clock, Eye, 
  Building2, Sun, Moon, Sparkles, Filter, AlertCircle,
  TrendingUp, Users, CheckCircle2, ArrowRight, Menu, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { offreAPI, entrepriseAPI } from '../services/api'
import { BrandMark } from '../components/BrandMark'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const OffresEmploiPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [offres, setOffres] = useState<any[]>([])
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // État pour le menu mobile
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Statistiques calculées dynamiquement à partir des données reçues de l'API
  const [statsOffres, setStatsOffres] = useState({
    totalActives: 0,
    entreprisesPartenaires: 0,
    salaireMoyen: 0,
    postulationsRapides: 98 // Taux d'acceptation fictif ou statistique fixe
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

        // Calcul des statistiques réelles à la volée
        const total = rawOffres.length
        const uniqueEntreprises = new Set(rawOffres.map((o: any) => o.id_entreprise)).size
        
        // Calcul du salaire de base moyen
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
        setStatsOffres({
          totalActives: 0,
          entreprisesPartenaires: 0,
          salaireMoyen: 0,
          postulationsRapides: 98,
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Filtrage intelligent
  const filteredOffres = offres.filter(offre => {
    const matchesSearch = 
      offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      offre.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || (offre.type_contrat && offre.type_contrat.toLowerCase() === filterType.toLowerCase())

    return matchesSearch && matchesType
  })

  // Extraction dynamique des types de contrat pour le bouton de filtrage
  const typesContrats = ['all', ...Array.from(new Set(offres.map(o => o.type_contrat).filter(Boolean)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-primary-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <BrandMark subtitle="Recrutement & Carrière" />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/offres" className="text-blue-600 dark:text-blue-400 transition-colors">Offres d'emploi</Link>
              <Link to="/entreprises" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Entreprises</Link>
              <Link to="/conseils" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Conseils Carrière</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Boutons Desktop */}
              <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
                  S'inscrire
                </Link>
              </div>

              {/* Bouton Hamburger Mobile */}
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

        {/* --- MENU MOBILE DÉROULANT --- */}
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
                    className="py-2 text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Offres d'emploi
                  </Link>
                  <Link 
                    to="/entreprises" 
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    Entreprises
                  </Link>
                  <Link 
                    to="/conseils" 
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-b border-slate-100 dark:border-slate-800/50"
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
                    className="w-full text-center py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/30 via-white to-transparent dark:from-primary-950/20 dark:via-slate-950 dark:to-transparent py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nouveau : Postulez en 1 clic sans CV physique</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Trouvez votre <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">emploi de rêve</span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Explorez les opportunités exclusives publiées par des entreprises en pleine croissance.
          </p>

          {/* Barre de Recherche */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un poste, un mot-clé ou une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base"
              />
            </div>
          </div>

          {/* --- SECTION STATISTIQUE STYLISÉE --- */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
            {[
              { label: "Offres Actives", val: loading ? "..." : statsOffres.totalActives, icon: Briefcase, color: "text-blue-500 bg-blue-500/10" },
              { label: "Partenaires", val: loading ? "..." : `${statsOffres.entreprisesPartenaires}+`, icon: Building2, color: "text-primary-500 bg-primary-500/10" },
              { label: "Moyenne Salaires", val: loading ? "..." : money.format(statsOffres.salaireMoyen), icon: TrendingUp, color: "text-primary-600 bg-primary-500/10" },
              { label: "Candidatures simples", val: `${statsOffres.postulationsRapides}%`, icon: CheckCircle2, color: "text-amber-500 bg-amber-500/10" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
              >
                <div className={`p-2.5 rounded-xl ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{stat.val}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CORPS PRINCIPAL --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Barre de Filtres Dynamiques */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Filtrer par contrat :</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {typesContrats.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {type === 'all' ? 'Tous les contrats' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Titre dynamique */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {searchTerm || filterType !== 'all' ? 'Résultats de recherche' : 'Offres récentes'}
          </h3>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
            {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} trouvée{filteredOffres.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* --- GRID OFFRES --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Recherche des offres en cours...</p>
          </div>
        ) : filteredOffres.length === 0 ? (
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Aucun résultat</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Aucune offre n'est disponible pour le moment avec ces critères.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                    key={offre.id_offre}
                    className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 hover:border-blue-500/40 dark:hover:border-blue-500/30 shadow-md hover:shadow-xl hover:shadow-blue-500/[0.02] dark:hover:shadow-blue-500/[0.01] transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Effet lumineux subtil en haut de la carte au survol */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                    <div>
                      {/* En-tête de carte */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-slate-800 dark:to-slate-800 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold shadow-inner">
                          {entreprise?.nom ? (
                            <span className="text-lg">{entreprise.nom.charAt(0).toUpperCase()}</span>
                          ) : (
                            <Briefcase className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1.5">
                          <span className="px-2.5 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold tracking-wide uppercase border border-green-200/30">
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
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                        {offre.titre}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {offre.description}
                      </p>

                      {/* Métadonnées */}
                      <div className="space-y-2.5 mb-6">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {entreprise?.code_entreprise ? (
                            <Link to={`/entreprise/${entreprise.code_entreprise}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {entreprise.nom}
                            </Link>
                          ) : (
                            <span>Entreprise non spécifiée</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{entreprise?.adresse || 'Télétravail / Distanciel'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {salaireFormate ? money.format(Number(offre.salaire_base)) : 'À négocier'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pied de carte */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expire le : {dateLimite}</span>
                      </span>
                      
                      <Link 
                        to={`/offres/${offre.id_offre}`} 
                        className="px-3.5 py-2 bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <span>Détails</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 py-10 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-slate-800 dark:text-white text-sm">RH Manager</span>
          </div>
          <p className="text-xs">© 2026 RH Manager. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}