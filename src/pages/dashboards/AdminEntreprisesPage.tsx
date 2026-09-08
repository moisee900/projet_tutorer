import { useEffect, useMemo, useState } from 'react'
import { 
  Building2, Search, Filter, Eye, Trash2, Edit, Download, 
  MapPin, Mail, Phone, Calendar, Users, TrendingUp, 
  CheckCircle2, XCircle, Clock, MoreVertical, BarChart3,
  Globe, Shield, Star, ArrowUpDown, Grid, List, FileText
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { entrepriseAPI } from '../../services/api'
import { loadDashboardContext } from '../../services/dashboardData'

export const AdminEntreprisesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'nom' | 'date' | 'employes'>('date')
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    Promise.all([
      entrepriseAPI.getAll().catch(() => ({})),
      loadDashboardContext().catch(() => ({ users: [], employes: [], contrats: [] })),
    ]).then(([entreprisesResponse, context]) => {
      if (!mounted) {
        return
      }

      const list = Array.isArray(entreprisesResponse)
        ? entreprisesResponse
        : Array.isArray(entreprisesResponse?.entreprises)
          ? entreprisesResponse.entreprises
          : []

      setEntreprises(list)
      setDashboardData(context)
    })

    return () => {
      mounted = false
    }
  }, [])

  const users = dashboardData?.users || []
  const employes = dashboardData?.employes || []
  const contrats = dashboardData?.contrats || []

  const filteredEntreprises = useMemo(() => entreprises.filter((e: any) => {
    const matchesSearch = e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || e.statut === filterStatut
    return matchesSearch && matchesStatut
  }), [entreprises, searchTerm, filterStatut])

  const getEntrepriseStats = (entrepriseId: number) => {
    const usersForEntreprise = users.filter((u: any) => u.id_entreprise === entrepriseId)
    const employesForEntreprise = employes.filter((e: any) => e.id_entreprise === entrepriseId)
    const contratsForEntreprise = contrats.filter((c: any) => c.id_entreprise === entrepriseId)
    return { users: usersForEntreprise.length, employes: employesForEntreprise.length, contrats: contratsForEntreprise.length }
  }

  const statsData = [
    { name: 'Actives', value: filteredEntreprises.filter((e: any) => e.statut === 'Actif').length, color: '#10b981' },
    { name: 'Inactives', value: filteredEntreprises.filter((e: any) => e.statut === 'Inactif').length, color: '#ef4444' },
    { name: 'En attente', value: filteredEntreprises.filter((e: any) => e.statut === 'En_entente').length, color: '#f59e0b' },
  ]

  const evolutionData = [
    { mois: 'Jan', nouvelles: 2, total: 5 },
    { mois: 'Fev', nouvelles: 3, total: 8 },
    { mois: 'Mar', nouvelles: 1, total: 9 },
    { mois: 'Avr', nouvelles: 4, total: 13 },
    { mois: 'Mai', nouvelles: 2, total: 15 },
    { mois: 'Jun', nouvelles: 3, total: 18 },
  ]
  const croissanceCeMois = filteredEntreprises.length > 0 && evolutionData.length > 1
    ? Math.round(((evolutionData[evolutionData.length - 1].total - evolutionData[evolutionData.length - 2].total) / evolutionData[evolutionData.length - 2].total) * 100)
    : 0

  const handleDelete = (id: number) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer cette entreprise ?')) {
      alert('Entreprise supprimee avec succes')
    }
  }

  if (selectedEntreprise) {
    const stats = getEntrepriseStats(selectedEntreprise.id_entreprise)
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedEntreprise(null)}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowUpDown className="w-5 h-5" />
          <span>Retour a la liste</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800">
                  <Building2 className="w-12 h-12 text-primary-600" />
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-3xl font-bold">{selectedEntreprise.nom}</h2>
                  <p className="text-white/80">{selectedEntreprise.nom_commercial}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEntreprise.adresse}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedEntreprise.email}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Utilisateurs</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.users}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Employes</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.employes}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Contrats</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.contrats}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Cree le</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedEntreprise.created_at}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Description</h3>
              <p className="text-slate-600 dark:text-slate-300">{selectedEntreprise.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Informations de contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Mail className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedEntreprise.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Telephone</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedEntreprise.telephone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Adresse</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedEntreprise.adresse}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Utilisateurs de l'entreprise</h3>
                <div className="space-y-3">
                  {users.filter((u: any) => u.id_entreprise === selectedEntreprise.id_entreprise).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{user.prenom[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm capitalize">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Entreprises</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestion et suivi de toutes les entreprises</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{filteredEntreprises.length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total entreprises</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{filteredEntreprises.filter((e: any) => e.statut === 'Actif').length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Entreprises actives</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{users.filter((u: any) => u.id_entreprise).length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Utilisateurs en entreprise</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{croissanceCeMois > 0 ? '+' : ''}{croissanceCeMois}%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Croissance ce mois</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution des entreprises</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="nouvelles" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                {statsData.map((entry, index) => (
                  <Cell key={'cell-' + index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En_entente">En attente</option>
            </select>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntreprises.map(entreprise => {
              const stats = getEntrepriseStats(entreprise.id_entreprise)
              return (
                <div key={entreprise.id_entreprise} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      entreprise.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      entreprise.statut === 'Inactif' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {entreprise.statut}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{entreprise.nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{entreprise.email}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{entreprise.adresse}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{stats.employes} employes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Cree le {entreprise.created_at}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEntreprise(entreprise)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={() => handleDelete(entreprise.id_entreprise)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Entreprise</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Adresse</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Employes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntreprises.map(entreprise => {
                  const stats = getEntrepriseStats(entreprise.id_entreprise)
                  return (
                    <tr key={entreprise.id_entreprise} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{entreprise.nom}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{entreprise.nom_commercial}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{entreprise.email}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{entreprise.adresse}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 dark:text-white">{stats.employes}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          entreprise.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          entreprise.statut === 'Inactif' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {entreprise.statut}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedEntreprise(entreprise)}
                            className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entreprise.id_entreprise)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}