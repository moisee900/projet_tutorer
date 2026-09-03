import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Users, Search, Mail, Phone, MapPin, Calendar, Briefcase, Eye, UserPlus, Grid, List, Loader2, RefreshCw, Copy, Check, CheckCircle2, AlertTriangle, Link as LinkIcon, Trash2 } from 'lucide-react'
import { clearDashboardContextCache, loadDashboardContext } from '../../services/dashboardData'
import { membreAPI, posteAPI } from '../../services/api'
import { Toast } from '../../components/ui/Toast'
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal'

// Définition statique et figée des rôles applicatifs
const ROLES_OPTIONS = [
  { slug: 'employe', nom: 'Employé' },
  { slug: 'rh', nom: 'Ressources Humaines (RH)' },
] as const

type CredentialsModalState = {
  status: 'pending' | 'success' | 'warning'
  prenom: string
  nom: string
  email: string
  password: string
  matricule: string
  message?: string
}

const getResponseValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source && source[key]) return source[key]
    if (source?.data && source.data[key]) return source.data[key]
    if (source?.credentials && source.credentials[key]) return source.credentials[key]
    if (source?.employe && source.employe[key]) return source.employe[key]
    if (source?.membre && source.membre[key]) return source.membre[key]
  }
  return undefined
}

const inferEmailSent = (source: any): boolean | undefined => {
  const explicit = source?.mail?.sent ?? source?.data?.mail?.sent ?? getResponseValue(source, ['email_sent', 'mail_sent', 'emailSent', 'mailSent'])
  if (typeof explicit === 'boolean') return explicit

  const emailStatus = String(getResponseValue(source, ['email_status', 'mail_status', 'status_email']) || '').toLowerCase()
  if (emailStatus) {
    if (['sent', 'envoye', 'envoyé', 'ok', 'success', 'succeeded'].some((flag) => emailStatus.includes(flag))) return true
    if (['failed', 'error', 'erreur', 'echec', 'échec', 'not_sent', 'non_envoye', 'non envoyé'].some((flag) => emailStatus.includes(flag))) return false
  }

  const message = String(source?.message || source?.data?.message || '').toLowerCase()
  if (/email|mail/.test(message) && /non envoye|non envoyé|echec|échec|failed|impossible|n'a pas pu/.test(message)) return false
  if (/email|mail/.test(message) && /envoye|envoyé|sent/.test(message)) return true

  return undefined
}

export const DirecteurMembresPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingMemberMatricule, setDeletingMemberMatricule] = useState<string | null>(null)
  const [showMemberDeleteConfirmation, setShowMemberDeleteConfirmation] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const [createdCredentials, setCreatedCredentials] = useState<CredentialsModalState | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const welcomeEmailsInProgress = useRef(new Set<string>())
  
  const [createForm, setCreateForm] = useState({
    prenom: '',
    nom: '',
    sexe: '',
    email: '',
    telephone: '',
    poste_id: '',
    role_name: 'employe',
  })
  
  const [availablePostes, setAvailablePostes] = useState<any[]>([])

  const loadData = useCallback(async (isBackground = false, forceRefresh = false) => {
    if (isBackground) {
      setIsRefreshing(true)
    }

    try {
      const context = await loadDashboardContext(forceRefresh)
      setDashboardData(context)
    } catch (error) {
      console.error('❌ Erreur chargement dashboard :', error)
    }

    try {
      const postesRes = await posteAPI.getAll()
      const postesList = Array.isArray(postesRes) ? postesRes : (postesRes?.postes || postesRes?.data || [])
      setAvailablePostes(postesList)
    } catch (error) {
      console.error('❌ Erreur chargement postes :', error)
      setAvailablePostes([])
    } finally {
      if (isBackground) {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    loadData(false, false)

    const intervalId = setInterval(() => {
      loadData(true, true)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [loadData])

  const companyId = useMemo(() => {
    if (!dashboardData) return null
    return (
      dashboardData.entreprise?.id_entreprise ||
      dashboardData.user?.id_entreprise ||
      dashboardData.user?.entreprise?.id_entreprise ||
      dashboardData.entreprises?.find((entreprise: any) => entreprise.user_id === dashboardData?.user?.id)?.id_entreprise ||
      dashboardData.entreprises?.find((entreprise: any) => entreprise.email === dashboardData?.user?.email)?.id_entreprise ||
      null
    )
  }, [dashboardData])

  const entrepriseServicesIds = useMemo(() => {
    const services = dashboardData?.services || []
    return services
      .filter((s: any) => !companyId || String(s.id_entreprise) === String(companyId))
      .map((s: any) => Number(s.id_service))
  }, [dashboardData, companyId])

  const postes = useMemo(() => {
    const list = availablePostes.length > 0 ? availablePostes : (dashboardData?.postes || [])
    if (!list || list.length === 0) return []

    return list.filter((p: any) => {
      if (p.id_service && entrepriseServicesIds.length > 0) {
        return entrepriseServicesIds.includes(Number(p.id_service))
      }
      if (p.id_entreprise && companyId) {
        return String(p.id_entreprise) === String(companyId)
      }
      return true
    })
  }, [availablePostes, dashboardData, entrepriseServicesIds, companyId])

  const posteIdsSet = useMemo(() => new Set(postes.map((p: any) => Number(p.id_poste))), [postes])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData?.employes])

  const employes = useMemo(() => {
    if (!rawEmployes || rawEmployes.length === 0) return []

    if (posteIdsSet.size === 0) {
      return rawEmployes
    }

    return rawEmployes.filter((emp: any) => {
      if (!emp.id_poste) return false
      return posteIdsSet.has(Number(emp.id_poste))
    })
  }, [rawEmployes, posteIdsSet])

  const filteredMembers = useMemo(() => {
    return employes.filter((emp: any) => {
      const prenom = emp.prenom || ''
      const nom = emp.nom || ''
      const email = emp.email || ''
      
      const matchesSearch = prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesService = filterService === 'all' || String(emp.id_poste) === filterService
      return matchesSearch && matchesService
    })
  }, [employes, searchTerm, filterService])

  const getPosteTitle = (idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    return poste?.titre_poste || 'N/A'
  }

  const copyToClipboard = async (text: string, fieldKey: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldKey)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      setToast({ type: 'error', message: 'Impossible de copier dans le presse-papiers.' })
    }
  }

  const buildCredentialsSummary = (credentials: CredentialsModalState) => {
    return [
      `Nom: ${credentials.prenom} ${credentials.nom}`,
      `Email: ${credentials.email}`,
      `Matricule: ${credentials.matricule}`,
      `Mot de passe temporaire: ${credentials.password}`,
    ].join('\n')
  }

  const buildCredentialsFromSource = (source: any, status: CredentialsModalState['status']): CredentialsModalState => {
    const anneeCourante = new Date().getFullYear()
    const fallbackPassword = createForm.nom
      ? `${createForm.nom.charAt(0).toUpperCase()}${createForm.nom.slice(1).toLowerCase()}@${anneeCourante}`
      : 'Non communiqué'

    return {
      status,
      prenom: String(getResponseValue(source, ['prenom']) || createForm.prenom || '-'),
      nom: String(getResponseValue(source, ['nom']) || createForm.nom || '-'),
      email: String(getResponseValue(source, ['email']) || createForm.email || '-'),
      password: String(getResponseValue(source, ['password', 'temp_password', 'temporary_password']) || fallbackPassword),
      matricule: String(getResponseValue(source, ['matricule']) || `EMP-${anneeCourante}-XXXXX`),
      message: String(source?.message || source?.data?.message || ''),
    }
  }

  const detectPartialCreationError = (error: any) => {
    const payload = error?.payload || error?.response?.data || {}
    const message = String(payload?.message || error?.message || '').toLowerCase()
    const hasCredentials = Boolean(
      getResponseValue(payload, ['email']) ||
      getResponseValue(payload, ['matricule']) ||
      getResponseValue(payload, ['password', 'temp_password', 'temporary_password'])
    )
    const emailFailure = /email|mail/.test(message) && /non envoye|non envoyé|echec|échec|failed|impossible|n'a pas pu/.test(message)
    const likelyCreated = hasCredentials || Boolean(payload?.employe || payload?.membre || getResponseValue(payload, ['matricule']))
    return emailFailure && likelyCreated ? payload : null
  }

  const isLikelyNetworkFailure = (error: any) => {
    const message = String(error?.message || '').toLowerCase()
    return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network error')
  }

  useEffect(() => {
    const credentials = createdCredentials
    if (!credentials || credentials.status !== 'pending') return

    // Le backend a déjà mis l'email dans la file d'attente.
    // On laisse juste le temps à l'interface de se stabiliser.
    const timer = setTimeout(() => {
      setCreatedCredentials((current) => current?.matricule === credentials.matricule
        ? { ...current, status: 'success', message: 'Email mis en file d\'attente par le serveur.' }
        : current)
      setSuccessMsg(`Membre créé avec succès. L'email sera automatiquement envoyé à ${credentials.email} dans quelques minutes (File d'attente).`)
      setToast({ type: 'success', message: `Membre créé. Email en file d'attente pour ${credentials.email}.` })
    }, 2000)

    return () => clearTimeout(timer)
  }, [createdCredentials])

  const retryWelcomeEmail = async () => {
    const credentials = createdCredentials
    if (!credentials || credentials.status !== 'warning') return

    setCreatedCredentials({ ...credentials, status: 'pending' })
    setSuccessMsg('Nouvelle tentative d\'envoi de l\'email en cours (côté serveur)...')

    setTimeout(() => {
      setCreatedCredentials((current) => current?.matricule === credentials.matricule
        ? { ...current, status: 'success', message: 'Nouvel email mis en file d\'attente par le serveur.' }
        : current)
      setToast({ type: 'success', message: 'Email remis en file d\'attente par le serveur.' })
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    
    const payload = {
      prenom: createForm.prenom,
      nom: createForm.nom,
      email: createForm.email,
      telephone: createForm.telephone,
      sexe: createForm.sexe,
      poste_id: createForm.poste_id,
      role_name: createForm.role_name,
      company_id: companyId,
    }

    setIsSubmitting(true)
    try {
      const response = await membreAPI.create(payload)
      
      setShowCreateModal(false)

      setCreatedCredentials(buildCredentialsFromSource(response, 'pending'))

      const createdEmploye = response?.employe || response?.data?.employe
      if (createdEmploye) {
        setDashboardData((current: any) => {
          const currentEmployes = current?.employes || []
          const withoutCreatedMember = currentEmployes.filter((employe: any) => employe.matricule !== createdEmploye.matricule)
          return { ...current, employes: [...withoutCreatedMember, createdEmploye] }
        })
      }

      setCreateForm({
        prenom: '',
        nom: '',
        sexe: '',
        email: '',
        telephone: '',
        poste_id: '',
        role_name: 'employe',
      })
      
      clearDashboardContextCache()
      void loadData(true, true)
      setSuccessMsg('Membre créé avec succès. Les informations sont actualisées et l\'envoi de l\'email est en cours.')
    } catch (err: any) {
      console.error(err)
      const partialPayload = detectPartialCreationError(err)
      if (partialPayload) {
        setShowCreateModal(false)
        setCreatedCredentials(buildCredentialsFromSource(partialPayload, 'warning'))
        setToast({ type: 'info', message: 'Le membre est créé, mais l\'email n\'a pas pu être envoyé. Copiez les identifiants manuellement.' })
        clearDashboardContextCache()
        void loadData(true, true)
      } else if (isLikelyNetworkFailure(err)) {
        clearDashboardContextCache()
        const freshContext = await loadDashboardContext(true).catch(() => null)
        const refreshedEmployes = freshContext?.employes || []
        const existing = refreshedEmployes.find((emp: any) => String(emp?.email || '').toLowerCase() === String(createForm.email || '').toLowerCase())

        if (existing) {
          setShowCreateModal(false)
          setCreatedCredentials(buildCredentialsFromSource({
            employe: existing,
            email: existing.email,
            prenom: existing.prenom,
            nom: existing.nom,
            matricule: existing.matricule,
            message: 'Membre détecté dans la base après erreur réseau. Vérifiez l\'envoi du mail.',
          }, 'warning'))
          setToast({ type: 'info', message: 'Création confirmée en base, mais réponse réseau incomplète. Vérifiez l\'email et partagez les accès si nécessaire.' })
          setSuccessMsg('Le membre est bien présent en base. Le retour API a échoué côté réseau, mais les informations sont disponibles.')
          setCreateForm({
            prenom: '',
            nom: '',
            sexe: '',
            email: '',
            telephone: '',
            poste_id: '',
            role_name: 'employe',
          })
          setDashboardData(freshContext)
        } else {
          setToast({ type: 'error', message: err?.payload?.message || err?.response?.data?.message || err?.message || 'Erreur réseau lors de la création de l\'employé.' })
        }
      } else {
        setToast({ type: 'error', message: err?.payload?.message || err?.response?.data?.message || err?.message || 'Erreur lors de la création de l\'employé.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMember?.matricule) {
      setToast({ type: 'error', message: 'Matricule du membre introuvable.' })
      return
    }

    setDeletingMemberMatricule(selectedMember.matricule)
    try {
      const response = await membreAPI.delete(selectedMember.matricule)
      setShowMemberDeleteConfirmation(false)
      setSelectedMember(null)
      clearDashboardContextCache()
      await loadData(true, true)
      setToast({ type: 'success', message: response?.message || 'Membre supprimé définitivement de la base de données.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Impossible de supprimer ce membre.' })
    } finally {
      setDeletingMemberMatricule(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Membres de l'entreprise</h1>
            {isRefreshing && (
              <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sync...</span>
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{employes.length} membres actifs</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => loadData(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm"
            title="Rafraîchir manuellement"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un employé</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total', value: employes.length, color: 'from-primary-500 to-primary-600', icon: Users },
          { label: 'Hommes', value: employes.filter((e: any) => e.sexe === 'M').length, color: 'from-primary-500 to-primary-600', icon: Users },
          { label: 'Femmes', value: employes.filter((e: any) => e.sexe === 'F').length, color: 'from-primary-500 to-primary-600', icon: Users },
          { label: 'Actifs', value: employes.filter((e: any) => (e.statut || 'Actif') === 'Actif').length, color: 'from-primary-500 to-primary-600', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dark:text-white" />
          </div>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dark:text-white">
            <option value="all">Tous les postes</option>
            {postes.map((p: any) => <option key={p.id_poste} value={String(p.id_poste)}>{p.titre_poste}</option>)}
          </select>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((emp: any) => (
            <div key={emp.matricule || emp.id} onClick={() => setSelectedMember(emp)} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-primary-500 to-primary-600'}`}>
                  <span className="text-white font-bold text-lg">{emp.prenom ? emp.prenom[0] : 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{emp.prenom} {emp.nom}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getPosteTitle(emp.id_poste)}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 flex-shrink-0" /><span>{emp.telephone || 'N/A'}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Calendar className="w-4 h-4 flex-shrink-0" /><span>Depuis {emp.date_embauche?.split('T')[0] || 'N/A'}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold">Membre</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden md:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Téléphone</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((emp: any) => (
                <tr key={emp.matricule || emp.id} onClick={() => setSelectedMember(emp)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                        <span className={`font-bold text-sm ${emp.sexe === 'M' ? 'text-blue-600' : 'text-primary-600'}`}>{emp.prenom ? emp.prenom[0] : 'U'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(emp.id_poste)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.telephone || 'N/A'}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil du membre</h3>
              <button type="button" onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedMember.sexe === 'M' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-primary-500 to-primary-600'}`}>
                  <span className="text-3xl font-bold text-white">{selectedMember.prenom ? selectedMember.prenom[0] : 'U'}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.prenom} {selectedMember.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{getPosteTitle(selectedMember.id_poste)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{selectedMember.statut || 'Actif'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selectedMember.email },
                  { icon: Phone, label: 'Téléphone', value: selectedMember.telephone || 'N/A' },
                  { icon: MapPin, label: 'Adresse', value: selectedMember.adresse || 'Non renseignée' },
                  { icon: Calendar, label: 'Date embauche', value: selectedMember.date_embauche?.split('T')[0] || 'N/A' },
                  { icon: Briefcase, label: 'Matricule', value: selectedMember.matricule || 'N/A' },
                  { icon: Users, label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Féminin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4 text-amber-500" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowMemberDeleteConfirmation(true)}
                  disabled={deletingMemberMatricule === selectedMember.matricule}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingMemberMatricule === selectedMember.matricule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{deletingMemberMatricule === selectedMember.matricule ? 'Suppression...' : 'Supprimer définitivement ce membre'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-md p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5 border ${createdCredentials.status === 'warning' ? 'border-amber-300 dark:border-amber-700/50' : createdCredentials.status === 'pending' ? 'border-blue-200 dark:border-blue-800/50' : 'border-emerald-200 dark:border-emerald-800/50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${createdCredentials.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : createdCredentials.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                {createdCredentials.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> : createdCredentials.status === 'pending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Identifiants du nouveau membre</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {createdCredentials.status === 'warning'
                    ? 'Le compte est créé, mais l\'envoi de l\'email a échoué. Transmettez les accès manuellement.'
                    : createdCredentials.status === 'pending'
                      ? 'Compte créé. Vérifiez les informations ci-dessous pendant l\'envoi de l\'email.'
                      : `Compte créé avec succès. Les identifiants ont été envoyés à ${createdCredentials.email}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-3 text-sm border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Nom complet</span>
                <span className="font-semibold text-slate-900 dark:text-white">{createdCredentials.prenom} {createdCredentials.nom}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Matricule</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{createdCredentials.matricule}</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Email (identifiant)</span>
                  <span className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">{createdCredentials.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                  title="Copier l'email"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Mot de passe temporaire</span>
                  <span className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 break-all">{createdCredentials.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                  title="Copier le mot de passe"
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${createdCredentials.status === 'warning' ? 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/40' : createdCredentials.status === 'pending' ? 'bg-blue-50 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800/40' : 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/40'}`}>
              <p className={`text-xs leading-relaxed ${createdCredentials.status === 'warning' ? 'text-amber-800 dark:text-amber-200' : createdCredentials.status === 'pending' ? 'text-blue-800 dark:text-blue-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                {createdCredentials.status === 'warning'
                  ? 'Alerte email: l\'utilisateur n\'a pas reçu automatiquement son lien de connexion. Partagez ces identifiants de façon sécurisée et demandez-lui d\'utiliser la procédure de première connexion.'
                  : createdCredentials.status === 'pending'
                    ? 'Les informations sont déjà affichées et restent copiables. Envoi de l\'email à l\'employé en cours...'
                    : 'Un lien de connexion a été envoyé par email à cette adresse. Vous pouvez également copier les accès ci-dessous en cas de besoin.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {createdCredentials.status === 'warning' && (
                <button
                  type="button"
                  onClick={retryWelcomeEmail}
                  className="flex-1 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Réessayer l'envoi</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => copyToClipboard(buildCredentialsSummary(createdCredentials), 'all')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Copier tous les identifiants</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 ${createdCredentials.status === 'warning' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Terminer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer un profil employé</h3>
                <p className="text-xs text-slate-500">L'employé complétera le reste de ses informations depuis son espace.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">✕</button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prénom *</label>
                  <input value={createForm.prenom} onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <input value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sexe *</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sexe" value="M" checked={createForm.sexe === 'M'} onChange={(e) => setCreateForm({ ...createForm, sexe: e.target.value })} className="text-amber-600 focus:ring-primary-500" required />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Masculin</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sexe" value="F" checked={createForm.sexe === 'F'} onChange={(e) => setCreateForm({ ...createForm, sexe: e.target.value })} className="text-amber-600 focus:ring-primary-500" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Féminin</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                  <input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Téléphone *</label>
                  <input value={createForm.telephone} onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })} type="tel" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Poste *</label>
                  <select value={createForm.poste_id} onChange={(e) => setCreateForm({ ...createForm, poste_id: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm">
                    <option value="">Sélectionner un poste</option>
                    {postes.map((poste: any) => (
                      <option key={poste.id_poste} value={poste.id_poste}>{poste.titre_poste}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rôle d'accès</label>
                  <select value={createForm.role_name} onChange={(e) => setCreateForm({ ...createForm, role_name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold dark:text-white text-sm">
                    {ROLES_OPTIONS.map((role) => (
                      <option key={role.slug} value={role.slug}>{role.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm font-semibold">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Création du profil...' : 'Enregistrer et notifier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <DeleteConfirmationModal
        isOpen={showMemberDeleteConfirmation}
        title="Supprimer ce membre ?"
        description={`Le compte de ${selectedMember ? `${selectedMember.prenom || ''} ${selectedMember.nom || ''}`.trim() : 'ce membre'} et toutes ses données RH associées seront supprimés définitivement.`}
        isSubmitting={deletingMemberMatricule !== null}
        onCancel={() => setShowMemberDeleteConfirmation(false)}
        onConfirm={handleDeleteMember}
      />
    </div>
  )
}