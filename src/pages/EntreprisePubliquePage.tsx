import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Building2, MapPin, Mail, Phone, Calendar, Briefcase, DollarSign, Users, ArrowLeft, Eye, Clock, Globe, Award, CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { entrepriseAPI, offreAPI } from '../services/api'

export const EntreprisePubliquePage = () => {
  const { code } = useParams()
  const [filterOffre, setFilterOffre] = useState('all')
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [offres, setOffres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [entreprisesResponse, offresResponse] = await Promise.all([
          entrepriseAPI.getAll(),
          offreAPI.getPubliees(),
        ])
        setEntreprises(entreprisesResponse.entreprises || entreprisesResponse || [])
        setOffres(offresResponse.offres || offresResponse || [])
      } catch {
        setEntreprises([])
        setOffres([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const entreprise = entreprises.find(e => 
    e.code_entreprise === code || e.id_entreprise.toString() === code
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-slate-500 dark:text-slate-400">Chargement de l'entreprise...</div>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Building2 className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Entreprise non trouvee</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">L'entreprise que vous recherchez n'existe pas</p>
          <Link to="/offres" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold">
            Voir toutes les offres
          </Link>
        </div>
      </div>
    )
  }

  const offresEntreprise = offres.filter(o => o.id_entreprise === entreprise.id_entreprise)
  const filteredOffres = filterOffre === 'all' 
    ? offresEntreprise 
    : offresEntreprise.filter(o => o.statut === filterOffre)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/offres" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour aux offres</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-semibold text-sm sm:text-base">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm sm:text-base">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banniere entreprise */}
      <section className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600" />
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  Code: {entreprise.code_entreprise}
                </span>
                <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {entreprise.statut}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{entreprise.nom}</h1>
              <p className="text-white/90 text-lg">{entreprise.nom_commercial}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Infos entreprise */}
          <div className="lg:col-span-1 space-y-6">
            {/* Carte infos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Informations</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Adresse</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{entreprise.adresse}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm break-all">{entreprise.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Telephone</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{entreprise.telephone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cree le</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{entreprise.created_at}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Statistiques</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                  <Briefcase className="w-6 h-6 mx-auto mb-1 text-primary-600" />
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{offresEntreprise.length}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Offres actives</p>
                </div>
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-primary-600" />
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">24</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Employes</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">A propos</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {entreprise.description}
              </p>
            </div>
          </div>

          {/* Colonne droite : Offres d'emploi */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Offres d'emploi</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} disponible{filteredOffres.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <select value={filterOffre} onChange={(e) => setFilterOffre(e.target.value)} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                    <option value="all">Toutes les offres</option>
                    <option value="Publiee">Publiees</option>
                    <option value="Brouillon">Brouillons</option>
                  </select>
                </div>
              </div>

              {filteredOffres.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">Aucune offre disponible pour le moment</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredOffres.map(offre => (
                    <Link
                      key={offre.id_offre}
                      to={`/offres/${offre.id_offre}`}
                      className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600">
                            {offre.titre}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {offre.description}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold flex-shrink-0 ml-4">
                          {offre.statut}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-primary-600">${offre.salaire_base}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Date limite: {offre.date_limite}</span>
                        </span>
                      </div>
                      <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>Voir les details et postuler</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Processus de recrutement */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl p-6 mt-6 border border-primary-200 dark:border-primary-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Comment postuler ?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { num: 1, title: 'Choisir une offre', desc: 'Parcourez nos offres' },
                  { num: 2, title: 'Soumettre CV', desc: 'Envoyez votre candidature' },
                  { num: 3, title: 'Entretien', desc: 'Passez l\'entretien' },
                  { num: 4, title: 'Embauche', desc: 'Rejoignez l\'equipe' },
                ].map((step, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white font-bold">{step.num}</span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{step.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 RH Manager. Tous droits reserves.</p>
        </div>
      </footer>
    </div>
  )
}