import { useEffect, useMemo, useState } from 'react'
import { 
  Users, Search, Filter, MoreVertical, Shield, ShieldAlert,
  CheckCircle2, XCircle, Clock, Mail, Phone, MapPin,
  Download, Upload, UserPlus, Trash2, Edit, Eye, 
  BarChart3, Calendar, Activity, Lock, Unlock
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { loadDashboardContext } from '../../services/dashboardData'

export const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statutFilter, setStatutFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData)
  }, [])

  const users = dashboardData?.users || []
  const tauxConnexion = users.length > 0
    ? Math.round((users.filter((user: any) => user.statut === 'actif').length / users.length) * 100)
    : 0

  const filteredUsers = useMemo(() => users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatut = statutFilter === 'all' || user.statut === statutFilter
    return matchesSearch && matchesRole && matchesStatut
  }), [users, searchTerm, roleFilter, statutFilter])

  const roleDistribution = [
    { name: 'Admin', value: users.filter((u: any) => u.role === 'admin').length, color: '#ef4444' },
    { name: 'Directeur', value: users.filter((u: any) => u.role === 'directeur').length, color: '#f59e0b' },
    { name: 'RH', value: users.filter((u: any) => u.role === 'rh').length, color: '#8b5cf6' },
    { name: 'Manager', value: users.filter((u: any) => u.role === 'manager').length, color: '#10b981' },
    { name: 'Employe', value: users.filter((u: any) => u.role === 'employe').length, color: '#3b82f6' },
  ]

  const activityData = [
    { jour: 'Lun', connexions: 45, actions: 120 },
    { jour: 'Mar', connexions: 62, actions: 185 },
    { jour: 'Mer', connexions: 38, actions: 95 },
    { jour: 'Jeu', connexions: 71, actions: 210 },
    { jour: 'Ven', connexions: 55, actions: 165 },
    { jour: 'Sam', connexions: 12, actions: 30 },
    { jour: 'Dim', connexions: 8, actions: 15 },
  ]

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id))
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      directeur: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      rh: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      manager: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      employe: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    }
    return colors[role] || colors.employe
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Gestion des Utilisateurs</h1>
          <p className="text-slate-600 dark:text-slate-400">Administration complete des comptes et permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{users.length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total utilisateurs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{users.filter((u: any) => u.statut === 'actif').length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Comptes actifs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{users.filter((u: any) => u.role === 'admin').length}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Administrateurs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{tauxConnexion}%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Taux de connexion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Activite des connexions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="jour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="connexions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actions" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition des roles</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                {roleDistribution.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
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
              <input type="text" placeholder="Rechercher un utilisateur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="all">Tous les roles</option>
              <option value="admin">Admin</option>
              <option value="directeur">Directeur</option>
              <option value="rh">RH</option>
              <option value="manager">Manager</option>
              <option value="employe">Employe</option>
            </select>
            <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{selectedUsers.length} utilisateur(s) selectionne(s)</span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Activer</button>
              <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Desactiver</button>
              <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4"><input type="checkbox" checked={selectedUsers.length === filteredUsers.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300" /></th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Utilisateur</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Derniere connexion</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-4"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} className="w-4 h-4 rounded border-slate-300" /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.prenom[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleColor(user.role)}`}>{user.role}</span></td>
                  <td className="py-4 px-4">
                    <span className={`flex items-center space-x-1.5 text-sm ${user.statut === 'actif' ? 'text-green-600' : user.statut === 'inactif' ? 'text-red-600' : 'text-amber-600'}`}>
                      {user.statut === 'actif' ? <CheckCircle2 className="w-4 h-4" /> : user.statut === 'inactif' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span className="capitalize">{user.statut}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{user.created_at}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedUser(user); setShowUserModal(true) }} className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil Utilisateur</h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{selectedUser.prenom[0]}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedUser.prenom} {selectedUser.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleColor(selectedUser.role)}`}>{selectedUser.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Telephone</p>
                  <p className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2"><Phone className="w-4 h-4" /><span>{selectedUser.telephone}</span></p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Adresse</p>
                  <p className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>{selectedUser.adresse}</span></p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Entreprise</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedUser.id_entreprise ? 'VitaService SARL' : 'Non assigne'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Membre depuis</p>
                  <p className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{selectedUser.created_at}</span></p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Authentification 2FA</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Securite additionnelle du compte</p>
                </div>
                <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold flex items-center space-x-2"><CheckCircle2 className="w-4 h-4" /><span>Activee</span></button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">Fermer</button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Modifier le profil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}