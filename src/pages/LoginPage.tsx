import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Building2, Mail, Lock, Eye, EyeOff, Users, LogIn, Loader2, 
  Sparkles, TrendingUp, ShieldCheck, ArrowRight, Activity, Cpu
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Toast } from '../components/ui/Toast'
import { API_BASE_URL } from '../config/api'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  
  // États pour les vraies données de la base
  const [stats, setStats] = useState({ utilisateurs: 0, entreprises: 0, contrats_actifs: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  const navigate = useNavigate()
  const { login } = useAuth()

  // Résolution et nettoyage dynamique de l'URL de l'API
  const API_URL = useMemo(() => API_BASE_URL, [])

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Éléments d'ambiance en arrière-plan */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      <PublicNavbar />
      
      <div className="pt-28 pb-16 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* --- PANNEAU GAUCHE : FORMULAIRE DE CONNEXION --- */}
          <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800/80 p-8 flex flex-col justify-between transition-all hover:border-slate-300/50 dark:hover:border-slate-700/80">
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Building2 className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Connexion</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Heureux de vous revoir sur RH Manager</p>
              </div>

              {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email de connexion</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
                </button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                Données chiffrées & Connexion sécurisée
              </span>
            </div>
          </div>

          {/* --- PANNEAU DROITE : ADAPTATIF MODE SOMBRE / CLAIR --- */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950 dark:to-[#0c0f1d] rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
            
            {/* Effets lumineux internes réactifs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* En-tête réactive */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 bg-slate-200/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300/30 dark:border-white/10">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase">Dashboard RH Manager Live</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
                <span>Base active</span>
              </div>
            </div>

            {/* Graphique réactif */}
            <div className="relative z-10 my-10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 shadow-md dark:shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-500 dark:text-primary-400" /> Tendance de l'Écosystème
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Croissance globale de la plateforme</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Statut</span>
                  <div className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center justify-end">
                    <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" /> +14.2%
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
                <span className="absolute w-3.5 h-3.5 bg-primary-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md" style={{ left: '44%', bottom: '37%' }}></span>
                <span className="absolute w-3.5 h-3.5 bg-primary-500 dark:bg-primary-400 rounded-full border-2 border-white dark:border-slate-900 shadow-md animate-pulse" style={{ left: '98%', bottom: '77%' }}></span>
              </div>
            </div>

            {/* Micro-cartes statistiques réactives */}
            <div className="relative z-10 grid grid-cols-3 gap-4">
              
              {/* Carte Utilisateurs */}
              <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 hover:bg-white/90 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/10 shadow-sm transition-all duration-300 group">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Membres</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-baseline">
                  {loadingStats ? (
                    <span className="text-lg text-slate-400 dark:text-slate-500 animate-pulse">...</span>
                  ) : (
                    stats.utilisateurs
                  )}
                  <span className="text-xs text-primary-600 dark:text-primary-400 ml-1 font-normal group-hover:translate-x-0.5 transition-transform">pro</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary-500/80" /> Comptes actifs
                </div>
              </div>

              {/* Carte Entreprises */}
              <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 hover:bg-white/90 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/10 shadow-sm transition-all duration-300 group">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Filiales</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {loadingStats ? (
                    <span className="text-lg text-slate-400 dark:text-slate-500 animate-pulse">...</span>
                  ) : (
                    stats.entreprises
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary-500/80" /> Entreprises
                </div>
              </div>

              {/* Carte Contrats ou Activité */}
              <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 hover:bg-white/90 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/10 shadow-sm transition-all duration-300 group">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Recrutements</span>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-baseline">
                  {loadingStats ? (
                    <span className="text-lg text-slate-400 dark:text-slate-500 animate-pulse">...</span>
                  ) : (
                    stats.contrats_actifs
                  )}
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1 font-normal">ok</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500/80 dark:text-emerald-500/70" /> Signatures
                </div>
              </div>

            </div>

            {/* Message de bas de page réactif */}
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-3">
              <span>Besoin de créer un nouvel espace entreprise ?</span>
              <Link 
                to="/create-entreprise" 
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-bold transition-all group"
              >
                Inscrire mon entreprise 
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}