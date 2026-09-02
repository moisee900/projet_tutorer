import { useState } from 'react'
import { 
  Settings, Save, User, Bell, Shield, Palette, Globe, 
  Mail, CreditCard, Code, Database, Lock, Moon, Sun,
  CheckCircle2, AlertCircle, Upload, Download
} from 'lucide-react'

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security' | 'email' | 'integrations' | 'legal'>('general')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setSaved(true) }, 1000)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'appearance' as const, label: 'Apparence', icon: Palette },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Securite', icon: Shield },
    { id: 'email' as const, label: 'Email & SMS', icon: Mail },
    { id: 'integrations' as const, label: 'Integrations', icon: Code },
    { id: 'legal' as const, label: 'Legal & RGPD', icon: Database },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Parametres du Systeme</h1>
          <p className="text-slate-600 dark:text-slate-400">Configuration complete de la plateforme</p>
        </div>
        {saved && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700 dark:text-green-300">Modifications sauvegardees</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom de l'entreprise</label>
                  <input type="text" defaultValue="RH Manager" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email de contact</label>
                  <input type="email" defaultValue="contact@rhpro.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fuseau horaire</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>Africa/Lubumbashi (UTC+2)</option>
                    <option>Africa/Kinshasa (UTC+1)</option>
                    <option>Europe/Paris (UTC+1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Langue par defaut</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>Francais</option>
                    <option>English</option>
                    <option>Swahili</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Format de date</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>JJ/MM/AAAA</option>
                    <option>MM/JJ/AAAA</option>
                    <option>AAAA-MM-JJ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Devise</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>CDF (FC)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">Mode maintenance</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Bloquer l'acces aux utilisateurs non-admin</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  <button className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl border-2 border-primary-500 text-center">
                    <Sun className="w-8 h-8 mx-auto mb-2 text-slate-800" />
                    <p className="font-semibold text-slate-800">Clair</p>
                  </button>
                  <button className="p-4 bg-slate-800 rounded-xl border-2 border-slate-600 text-center">
                    <Moon className="w-8 h-8 mx-auto mb-2 text-white" />
                    <p className="font-semibold text-white">Sombre</p>
                  </button>
                  <button className="p-4 bg-gradient-to-br from-slate-100 to-slate-800 rounded-xl border-2 border-slate-400 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-600"></div>
                    <p className="font-semibold text-slate-800">Auto</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Couleur principale</label>
                <div className="flex space-x-3">
                  {['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: color }}></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Logo</label>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center"><span className="text-2xl font-bold text-primary-600">RH</span></div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-white">Logo actuel</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">PNG, JPG ou SVG. Max 2MB.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center space-x-2"><Upload className="w-4 h-4" /><span>Changer</span></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { title: 'Notifications par email', desc: 'Recevoir les alertes et rapports par email', default: true },
                { title: 'Alertes de securite', desc: 'Notifications immediates pour les activites suspectes', default: true },
                { title: 'Rapports hebdomadaires', desc: 'Resume automatique chaque lundi a 08:00', default: false },
                { title: 'Rappels de conges', desc: 'Rappel 7 jours avant l\'expiration d\'un conge', default: true },
                { title: 'Nouveaux candidats', desc: 'Notification lors d\'une nouvelle postulation', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{item.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 text-primary-600 rounded" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Complexite du mot de passe</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>Elevee (12+ caracteres, symboles)</option>
                    <option>Moyenne (8+ caracteres)</option>
                    <option>Minimale (6 caracteres)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Duree de session (minutes)</label>
                  <input type="number" defaultValue="120" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Authentification a deux facteurs</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Obligatoire pour les administrateurs</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Verification IP</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Bloquer les connexions hors pays autorises</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Serveur SMTP</label>
                  <input type="text" defaultValue="smtp.rhpro.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Port</label>
                  <input type="number" defaultValue="587" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Utilisateur</label>
                  <input type="text" defaultValue="noreply@rhpro.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe</label>
                  <input type="password" defaultValue="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center space-x-2"><Mail className="w-4 h-4" /><span>Tester la connexion</span></button>
                <span className="text-sm text-green-600 flex items-center space-x-1"><CheckCircle2 className="w-4 h-4" /><span>SMTP OK</span></span>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'WhatsApp Business', status: 'connected', icon: '💬' },
                { name: 'Stripe', status: 'disconnected', icon: '💳' },
                { name: 'Google Workspace', status: 'connected', icon: '📧' },
                { name: 'Slack', status: 'disconnected', icon: '💬' },
                { name: 'API Externe', status: 'connected', icon: '🔌' },
              ].map((integration, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{integration.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{integration.status === 'connected' ? 'Connecte' : 'Deconnecte'}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">{integration.name}</h4>
                  <button className={`w-full py-2 rounded-lg text-sm font-semibold ${integration.status === 'connected' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}>{integration.status === 'connected' ? 'Deconnecter' : 'Connecter'}</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Politique de confidentialite</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" defaultValue="Nous collectons et traitons vos donnees personnelles conformement au RGPD..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Conditions d'utilisation</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" defaultValue="En utilisant cette plateforme, vous acceptez nos conditions..."></textarea>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">Conformite RGPD</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Assurez-vous que vos politiques sont a jour et conformes aux regulations locales.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">Reinitialiser</button>
          <button onClick={handleSave} disabled={loading} className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold flex items-center space-x-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
            <span>{loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}