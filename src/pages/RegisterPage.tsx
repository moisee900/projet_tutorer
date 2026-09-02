import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, MapPin, Crown, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Toast } from '../components/ui/Toast'
import { offreAPI } from '../services/api'

type RegistrationCompany = { id_entreprise: number; nom: string }

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '', post_nom: '', prenom: '', email: '', telephone: '', adresse: '',
    password: '', password_confirmation: '', role: 'utilisateur', id_entreprise: '',
  })
  const [companies, setCompanies] = useState<RegistrationCompany[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const navigate = useNavigate()
  const { register } = useAuth()

  useEffect(() => {
    offreAPI.getAll()
      .then((response) => {
        const uniqueCompanies = new Map<number, RegistrationCompany>()
        for (const offer of response.offres ?? []) {
          if (offer.entreprise?.id_entreprise && offer.entreprise?.nom) {
            uniqueCompanies.set(offer.entreprise.id_entreprise, offer.entreprise)
          }
        }
        setCompanies([...uniqueCompanies.values()])
      })
      .catch(() => setCompanies([]))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setToast({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    if (loading) return

    setError('')
    setSuccess('')
    setLoading(true)
    setToast({ type: 'info', message: 'Inscription en cours...' })

    try {
      // Appel du service vers /api/register
      const result = await register({
        nom: formData.nom,
        post_nom: formData.post_nom,
        prenom: formData.prenom,
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone,
        adresse: formData.adresse,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        id_entreprise: formData.role === 'utilisateur' ? Number(formData.id_entreprise) : undefined,
      })

      // Validation de la réponse selon la structure du RegisterController
      if (!result || result.success === false) {
        setError(result.message || "Erreur lors de l'inscription")
        setToast({ type: 'error', message: result.message || "Erreur lors de l'inscription" })
        return
      }

      // Stockage local des identifiants (gérés de manière transparente par authService)
      if (result.token && result.user) {
        localStorage.setItem('auth_token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      // Logique de redirection selon le statut généré par le contrôleur
      // Rappel Laravel : 'utilisateur' -> 'en_attente', les autres rôles -> 'actif'
      if (formData.role === 'directeur') {
        localStorage.setItem('temp_user', JSON.stringify(result.user))
        setToast({ type: 'success', message: 'Compte directeur créé avec succès ! Redirection...' })
        setTimeout(() => navigate(result.redirect || '/dashboard/directeur', { replace: true }), 1500)
        return
      }

      // Cas standard : utilisateur en_attente
      setSuccess('Inscription réussie ! Votre compte est en attente de validation par un administrateur.')
      setToast({ type: 'success', message: 'Compte créé ! Redirection vers la page de connexion...' })
      setTimeout(() => {
        navigate(result.redirect || '/login?registered=1')
      }, 2500)

    } catch (err: unknown) {
      // Capture les erreurs de validation brutes (ex: email unique) renvoyées par Axios
      const rawError = err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription"
      setError(rawError)
      setToast({ type: 'error', message: rawError })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-primary-50 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10">
      <PublicNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-2xl shadow-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Créer un compte</h1>
            <p className="text-slate-600 dark:text-slate-300">Rejoignez RH Manager en quelques étapes</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Informations sur le comportement des rôles */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-800 dark:text-primary-200">
                <strong>Choisissez votre type de compte :</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Utilisateur</strong> : Pour postuler aux offres (soumis à validation)</li>
                  <li><strong>Directeur</strong> : Pour enregistrer et configurer votre structure</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-warm-50 dark:bg-warm-900/30 border border-warm-200 dark:border-warm-800 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warm-700 dark:text-warm-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-700 dark:text-primary-300">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type de compte */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Type de compte *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'utilisateur' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'
                  }`}>
                    <input type="radio" name="role" value="utilisateur" checked={formData.role === 'utilisateur'} onChange={handleChange} className="sr-only" />
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'utilisateur' ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <User className={`w-6 h-6 ${formData.role === 'utilisateur' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">Utilisateur</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Postuler et faire des demandes</p>
                      </div>
                    </div>
                  </label>

                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'directeur' 
                      ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-warm-300'
                  }`}>
                    <input type="radio" name="role" value="directeur" checked={formData.role === 'directeur'} onChange={handleChange} className="sr-only" />
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'directeur' ? 'bg-warm-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <Crown className={`w-6 h-6 ${formData.role === 'directeur' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">Directeur</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Créer et gérer une entreprise</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.role === 'utilisateur' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Entreprise suivie *</label>
                  <select name="id_entreprise" value={formData.id_entreprise} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white">
                    <option value="">Choisir une entreprise</option>
                    {companies.map((company) => <option key={company.id_entreprise} value={company.id_entreprise}>{company.nom}</option>)}
                  </select>
                </div>
              )}

              {/* Identité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre nom" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Post-nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="post_nom" value={formData.post_nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Post-nom" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prénom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre prénom" required />
                </div>
              </div>

              {/* Coordonnées */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="votre@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="+243 ..." required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre adresse" required />
                </div>
              </div>

              {/* Mots de passe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Min. 6 caractères" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirmer *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Confirmez" required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                <span>{loading ? 'Inscription en cours...' : (formData.role === 'directeur' ? "Continuer vers la création d'entreprise" : 'Créer mon compte')}</span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}