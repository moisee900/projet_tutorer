import { useState, useEffect } from 'react'
import { PublicNavbar } from '../components/PublicNavbar'
import { Link } from 'react-router-dom'
import { Building2, Users, Briefcase, ArrowRight, CheckCircle2, Sparkles, Crown, Star, Zap, Shield, Calendar, MapPin } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

export const HomePage = () => {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  
  // État étendu connecté aux valeurs réelles renvoyées par l'API Laravel
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const apiBase = API_BASE_URL

        // 1. Récupération des dernières offres d'emploi
        const responseOffres = await fetch(`${apiBase}/offres-accueil`)
        const resultOffres = await responseOffres.json()
        if (resultOffres.success) {
          setOffres(resultOffres.data)
        }

        // 2. Récupération des statistiques réelles du dashboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-primary-900/10">
      <PublicNavbar />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-primary-200 dark:border-primary-800 mb-6">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-bold text-primary-700 dark:text-primary-300">Nouvelle génération de gestion RH</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-slate-800 dark:text-white">Gérez votre</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent">entreprise</span>
                <br />
                <span className="text-slate-800 dark:text-white">intelligemment</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                La plateforme tout-en-un qui révolutionne la gestion des ressources humaines. Recrutement, contrats, paie, congés.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
                  <span>Démarrer maintenant</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/offres" className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-full shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700 transition-all">
                  <Briefcase className="mr-2 w-5 h-5" />
                  <span>Voir les offres</span>
                </Link>
              </div>

              {/* --- STATISTIQUES HERO --- */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <Users className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.utilisateurs}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Utilisateurs</div>
                </div>
                <div className="text-center lg:text-left">
                  <Building2 className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.entreprises}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Entreprises</div>
                </div>
                <div className="text-center lg:text-left">
                  <Briefcase className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.offres_actives}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Offres Actives</div>
                </div>
              </div>
            </div>

            {/* --- DASHBOARD PREVIEW DYNAMIQUE --- */}
            <div className="relative hidden lg:block">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-auto">Dashboard RH MANAGER</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Volume de recrutements (12 mois glissants)</div>
                    <div className="text-2xl font-bold text-primary-600">
                      {loading ? "..." : `+${stats.nouveaux_contrats}`} ce mois
                    </div>
                  </div>
                  
                  {/* Graphique dynamique avec hauteurs et valeurs en base de données */}
                  <div className="flex items-end space-x-2 h-32 pt-4">
                    {stats.graphique.hauteurs.map((height, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${Math.max(height, 5)}%` }} // Garde une petite présence visuelle même si égal à 0
                        className="group relative flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg opacity-80 hover:opacity-100 transition-all cursor-pointer"
                      >
                        {/* Tooltip interactif contenant le nom du mois et les contrats */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-10 border border-slate-700">
                          {stats.graphique.labels[i]} : {stats.graphique.valeurs[i]} recrutement(s)
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Légende du graphique (Noms des mois abrégés) */}
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500 px-1">
                    {stats.graphique.labels.map((label, idx) => (
                      <span key={idx} className="w-full text-center truncate">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-900/30 p-4 rounded-2xl border border-primary-200 dark:border-primary-800">
                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-300">Contrats actifs</div>
                      <div className="text-2xl font-bold text-primary-700 dark:text-primary-200">
                        {loading ? "..." : stats.contrats_actifs}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-900/30 p-4 rounded-2xl border border-primary-200 dark:border-primary-800">
                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-300">Nouveaux ce mois</div>
                      <div className="text-2xl font-bold text-primary-700 dark:text-primary-200">
                        {loading ? "..." : stats.nouveaux_contrats}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION DES DERNIÈRES OFFRES D'EMPLOI --- */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Cercles décoratifs subtils en arrière-plan pour la cohérence visuelle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary-100/20 dark:bg-primary-950/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Dernières opportunités publiées
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Rejoignez l'une des entreprises partenaires de la plateforme RH Manager. Vos compétences méritent le meilleur cadre.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement des opportunités...</span>
            </div>
          ) : !offres || offres.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 max-w-3xl mx-auto px-6">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Aucune offre d'emploi</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucune offre n'est disponible pour le moment. Revenez un peu plus tard !
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offres.map((offre: any) => {
                // Gestion sécurisée des dates pour éviter que le composant ne plante (bloque)
                const dateCreation = offre.created_at ? new Date(offre.created_at).toLocaleDateString('fr-FR') : "Récemment";
                const dateLimite = offre.date_limite ? new Date(offre.date_limite).toLocaleDateString('fr-FR') : "Non spécifiée";
                const salaireFormate = offre.salaire_base ? Number(offre.salaire_base).toLocaleString('fr-FR') : "À négocier";

                return (
                  <div 
                    key={offre.id_offre} 
                    className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
                  >
                    <div>
                      {/* En-tête de la carte */}
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <span className="inline-flex px-4 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full border border-primary-200/50 dark:border-primary-800/30">
                          {salaireFormate !== "À négocier" ? `${salaireFormate} €` : salaireFormate}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center shrink-0">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {dateCreation}
                        </span>
                      </div>

                      {/* Titre & Description */}
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-3">
                        {offre.titre || "Titre non spécifié"}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-6">
                        {offre.description || "Aucune description fournie pour cette offre d'emploi."}
                      </p>
                    </div>

                    {/* Pied de la carte */}
                    <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5 mt-auto flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">Limite : {dateLimite}</span>
                      </div>
                      
                      <Link 
                        to={`/offres/${offre.id_offre}`} 
                        className="inline-flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group/btn"
                      >
                        <span>Voir l'offre</span>
                        <ArrowRight className="ml-1 w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bouton Voir toutes les offres */}
          <div className="text-center mt-16">
            <Link 
              to="/offres" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-full shadow-lg hover:shadow-xl border-2 border-slate-200/80 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Parcourir toutes les offres</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION CREATION D'ENTREPRISE --- */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-orange-50 to-red-50 dark:from-primary-900/20 dark:via-orange-900/20 dark:to-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 mb-6">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Devenez propriétaire d'entreprise</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Créez votre entreprise en
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-orange-600 to-red-600 bg-clip-text text-transparent">quelques minutes</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Lancez votre entreprise et devenez automatiquement Directeur. Gérez votre équipe, publiez des offres d'emploi et développez votre activité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Zap, title: "Création rapide", desc: "Formulaire simple et intuitif", color: "from-primary-500 to-primary-500" },
              { icon: Shield, title: "Sécurisé", desc: "Données protégées et chiffrées", color: "from-primary-500 to-red-500" },
              { icon: Star, title: "Support dédié", desc: "Accompagnement personnalisé", color: "from-red-500 to-primary-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/entreprise/inscription" className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary-500 via-orange-50 to-red-500 hover:from-primary-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
              <Crown className="mr-3 w-6 h-6" />
              <span>Créer mon entreprise maintenant</span>
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Gratuit • Sans engagement • Configuration immédiate
            </p>
          </div>
        </div>
      </section>

      {/* --- AUTRES FONCTIONNALITES --- */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Toutes les fonctionnalités
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent">dont vous avez besoin</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: "Recrutement", desc: "Publiez des offres, recevez les candidatures, planifiez des entretiens.", color: "from-primary-500 to-primary-600" },
              { icon: CheckCircle2, title: "Contrats", desc: "Créez, signez et archivez tous vos contrats avec renouvellement automatique.", color: "from-primary-500 to-primary-600" },
              { icon: Users, title: "Employés", desc: "Gestion complète des employés, services et postes de votre entreprise.", color: "from-secondary-500 to-primary-600" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">RH Manager</span>
                <p className="text-xs text-slate-400">Enterprise Suite</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">© 2026 RH Manager. Tous droits réservés.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}