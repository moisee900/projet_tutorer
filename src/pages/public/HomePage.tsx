import { Link } from 'react-router-dom';
import { 
  Building2, Users, FileText, Calendar, DollarSign, 
  Shield, TrendingUp, ArrowRight, CheckCircle2, 
  Sparkles, Briefcase, BarChart3, Bell
} from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
                RH Manager
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Fonctionnalites</a>
              <a href="#how" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Comment ca marche</a>
              <a href="#roles" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Pour qui ?</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login"
                className="px-5 py-2.5 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Connexion
              </Link>
              <Link 
                to="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-slate-50 via-primary-50/30 to-primary-50/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-primary-100 mb-6">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-primary-700">
                  Nouvelle generation de gestion RH
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-slate-800">Gerez votre</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 bg-clip-text text-transparent">
                  entreprise
                </span>
                <br />
                <span className="text-slate-800">intelligemment</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                La plateforme tout-en-un qui revolutionne la gestion des ressources humaines.
                Recrutement, contrats, paie, conges : simplifiez votre quotidien.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <span>Demarrer maintenant</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <Users className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-2xl font-bold text-slate-800">10K+</div>
                  <div className="text-sm text-slate-500">Utilisateurs</div>
                </div>
                <div className="text-center lg:text-left">
                  <Building2 className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-2xl font-bold text-slate-800">500+</div>
                  <div className="text-sm text-slate-500">Entreprises</div>
                </div>
                <div className="text-center lg:text-left">
                  <TrendingUp className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-2xl font-bold text-slate-800">99%</div>
                  <div className="text-sm text-slate-500">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="text-xs text-slate-400 ml-auto">Dashboard RH Manager</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">Effectifs ce mois</div>
                    <div className="text-2xl font-bold text-primary-600">+24</div>
                  </div>
                  
                  <div className="flex items-end space-x-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <div
                        key={i}
                        style={{ height: height + '%' }}
                        className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg opacity-80"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-3 rounded-xl">
                      <div className="text-xs text-primary-600 font-medium">Contrats actifs</div>
                      <div className="text-xl font-bold text-primary-700">142</div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-3 rounded-xl">
                      <div className="text-xs text-primary-600 font-medium">Conges en cours</div>
                      <div className="text-xl font-bold text-primary-700">8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Toutes les fonctionnalites
              <br />
              <span className="text-gradient">dont vous avez besoin</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une suite complete d'outils pour gerer chaque aspect des ressources humaines
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: "Recrutement", desc: "Publiez des offres, recevez les candidatures, planifiez des entretiens.", color: "from-primary-500 to-primary-700" },
              { icon: FileText, title: "Contrats", desc: "Creez, signez et archivez tous vos contrats. Renouvellements automatiques.", color: "from-primary-500 to-primary-700" },
              { icon: DollarSign, title: "Paie", desc: "Calculez les salaires, gerez les primes. Bulletins generes automatiquement.", color: "from-primary-500 to-primary-600" },
              { icon: Calendar, title: "Conges", desc: "Demandes en ligne, validation en un clic, calendrier partage.", color: "from-slate-500 to-slate-700" },
              { icon: Users, title: "Employes", desc: "Gestion complete des employes, services et postes de votre entreprise.", color: "from-primary-500 to-primary-500" },
              { icon: BarChart3, title: "Rapports", desc: "Tableaux de bord personnalises, KPIs, export PDF/Excel.", color: "from-primary-500 to-primary-600" },
              { icon: Shield, title: "Securite", desc: "Chiffrement de bout en bout, sauvegardes automatiques, RGPD.", color: "from-slate-600 to-slate-800" },
              { icon: Bell, title: "Notifications", desc: "Alertes personnalisees pour les echeances et evenements importants.", color: "from-primary-600 to-primary-600" },
              { icon: TrendingUp, title: "Statistiques", desc: "Analyses avancees, evolution des effectifs, masse salariale.", color: "from-primary-400 to-primary-600" },
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all">
                <div className={
                  'w-14 h-14 bg-gradient-to-br ' + feature.color + 
                  ' rounded-xl flex items-center justify-center shadow-lg mb-6 ' +
                  'group-hover:scale-110 group-hover:rotate-3 transition-all'
                }>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-xl text-slate-600">
              En 4 etapes simples, transformez la gestion de votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Inscrivez votre entreprise", desc: "Creez votre espace en 2 minutes" },
              { num: "02", title: "Configurez la structure", desc: "Departements, services et postes" },
              { num: "03", title: "Invitez votre equipe", desc: "Ajoutez employes et attribuez les roles" },
              { num: "04", title: "Gerez simplement", desc: "Tout est centralise et automatise" },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-slate-100 relative">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-100">
                  <span className="text-sm font-bold text-slate-400">{step.num}</span>
                </div>
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Une interface adaptee
              <br />
              <span className="text-gradient">a chaque utilisateur</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Directeur", desc: "Vision strategique et KPIs", color: "from-primary-500 to-primary-600" },
              { icon: Briefcase, title: "RH", desc: "Gestion quotidienne complete", color: "from-primary-500 to-primary-700" },
              { icon: Building2, title: "Manager", desc: "Management d'equipe", color: "from-primary-500 to-primary-700" },
              { icon: FileText, title: "Employe", desc: "Espace personnel complet", color: "from-slate-500 to-slate-700" },
            ].map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all">
                <div className={
                  'w-16 h-16 bg-gradient-to-br ' + role.color + 
                  ' rounded-2xl flex items-center justify-center shadow-lg mb-4'
                }>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{role.title}</h3>
                <p className="text-slate-600 mb-4">{role.desc}</p>
                <Link 
                  to="/login" 
                  className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center"
                >
                  En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pret a transformer votre gestion RH ?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Rejoignez les centaines d'entreprises qui ont deja revolutionne leur gestion
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-slate-50 text-primary-700 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RH Manager</span>
            </div>
            <div className="text-sm text-slate-400">
              (c) 2026 RH Manager. Tous droits reserves.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};