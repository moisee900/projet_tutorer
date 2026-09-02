import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Home, LogIn, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react'

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_45%,_#fff1f2_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_34%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1f2937_100%)]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-48 w-48 rounded-full bg-red-300/20 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 shadow-lg backdrop-blur dark:border-amber-900/50 dark:bg-slate-950/70 dark:text-amber-200">
              <Sparkles className="h-4 w-4" />
              Plan B activé
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl shadow-amber-500/30">
                  <Building2 className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">RH Manager</p>
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Cette page a quitté la route, mais votre espace RH reste accessible.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                La sous-route demandée n&apos;est pas servie directement lors du rafraîchissement. Le bouton ci-dessous vous ramène vers un écran sûr pour continuer sans perdre le contexte.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-black/20">
                <ShieldAlert className="mb-3 h-6 w-6 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Pourquoi ce message</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Si Vercel recharge une route profonde sans rewrite, il peut retourner une 404 avant que React ne prenne la main.
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-black/20">
                <RefreshCw className="mb-3 h-6 w-6 text-primary-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Ce que fait le plan B</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Il vous remet sur une page valide, puis vous pouvez revenir au tableau de bord ou à l’accueil en un clic.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-orange-500 to-red-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-500/30 transition-transform hover:-translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                Retour à l’accueil
              </Link>
              <Link
                to="/dashboard/directeur"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-lg transition-transform hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
              >
                <LogIn className="h-4 w-4" />
                Ouvrir le dashboard
              </Link>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-700 transition-transform hover:-translate-y-0.5 dark:bg-slate-800 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Page précédente
              </button>
            </div>
          </section>

          <aside className="relative">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/75 dark:shadow-black/30">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Etat</p>
                  <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">Route introuvable</p>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { title: 'Continuer sans perdre le flux', text: 'Retourner vers l’accueil ou le dashboard directeur.' },
                  { title: 'Conserver les accès', text: 'Les données du membre et les identifiants restent copiables.' },
                  { title: 'Prévenir le blocage serveur', text: 'Le fallback évite un écran vide quand l’URL profonde est rechargée.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
