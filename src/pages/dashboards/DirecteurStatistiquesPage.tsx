import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, Briefcase, Calendar, Award } from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { loadDashboardContext } from '../../services/dashboardData'

export const DirecteurStatistiquesPage = () => {
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const employes = dashboardData?.employes || []
  const contrats = dashboardData?.contrats || []
  const postes = dashboardData?.postes || []
  const services = dashboardData?.services || []
  const conges = dashboardData?.conges || []
  const statsEvolution = {
    effectifs: [],
    masseSalariale: [],
    recrutements: [],
  }

  const stats = {
    totalEmployes: employes.length,
    masseSalariale: contrats.reduce((sum: number, c: any) => sum + Number(c.salaire_base || 0), 0),
    postesOccupes: postes.filter((p: any) => p.statut === 'Occupe').length,
    congesApprouves: conges.filter((c: any) => c.statut === 'Approuve').length,
  }

  const repartitionSexe = [
    { name: 'Hommes', value: employes.filter((e: any) => e.sexe === 'M').length, color: '#3b82f6' },
    { name: 'Femmes', value: employes.filter((e: any) => e.sexe === 'F').length, color: '#ec4899' },
  ]

  const contratsParType = [
    { type: 'CDI', count: contrats.filter((c: any) => c.type === 'CDI').length },
    { type: 'CDD', count: contrats.filter((c: any) => c.type === 'CDD').length },
    { type: 'Stage', count: contrats.filter((c: any) => c.type === 'Stage').length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Statistiques generales</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Vue d'ensemble des performances de l'entreprise</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { icon: Users, label: 'Total employes', value: stats.totalEmployes, change: '+12%', color: 'from-primary-500 to-primary-600' },
          { icon: DollarSign, label: 'Masse salariale', value: '$' + (stats.masseSalariale / 1000).toFixed(1) + 'K', change: '+8%', color: 'from-primary-500 to-primary-600' },
          { icon: Briefcase, label: 'Postes occupes', value: stats.postesOccupes, change: '+3', color: 'from-primary-500 to-primary-600' },
          { icon: Calendar, label: 'Conges approuves', value: stats.congesApprouves, change: '+5', color: 'from-primary-500 to-primary-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution des effectifs</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={statsEvolution.effectifs}>
              <defs>
                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="employes" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEff)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Masse salariale mensuelle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statsEvolution.masseSalariale}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="montant" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition H/F</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={repartitionSexe} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                {repartitionSexe.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Types de contrats</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contratsParType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="type" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Recrutements</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={statsEvolution.recrutements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="nouveaux" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service: any) => {
            const count = employes.filter((e: any) => postes.some((p: any) => p.id_service === service.id_service && p.id_poste === e.id_poste)).length
            const percentage = (employes.length > 0 ? count / employes.length * 100 : 0).toFixed(1)
            return (
              <div key={service.id_service} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 dark:text-white text-sm">{service.nom}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{count} employes</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-500 h-2 rounded-full" style={{ width: percentage + '%' }}></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{percentage}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}