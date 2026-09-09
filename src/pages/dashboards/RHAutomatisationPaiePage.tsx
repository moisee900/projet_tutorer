import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, Clock, DollarSign, Eye, FileText, Play, RefreshCw, RotateCcw, ShieldCheck, Users, X, Ban } from 'lucide-react'
import { avancesPaieAPI, extractFichesPaie, type DemandeAvancePaie, fichesPaieAPI, type FichePaie } from '../../services/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const RHAutomatisationPaiePage = ({ title = 'Paie mensuelle', subtitle = 'Les fiches sont calculées, contrôlées puis validées par le RH ou le DG.' }: { title?: string; subtitle?: string }) => {
  const [fiches, setFiches] = useState<FichePaie[]>([])
  const [avances, setAvances] = useState<DemandeAvancePaie[]>([])
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [selectedFiche, setSelectedFiche] = useState<FichePaie | null>(null)

  const load = async () => {
    setBusy(true)
    try {
      const [paieResponse, avanceResponse] = await Promise.all([fichesPaieAPI.getAll(), avancesPaieAPI.getAll()])
      setFiches(extractFichesPaie(paieResponse))
      setAvances(avanceResponse.demandes ?? [])
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de charger les données de paie.' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(loadTimer)
  }, [])

  const generate = async () => {
    setBusy(true)
    setFeedback(null)
    try {
      const response = await fichesPaieAPI.generate(Number(month), Number(year))
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'La génération a échoué.' })
      setBusy(false)
    }
  }

  const validate = async (id: number) => {
    setBusy(true)
    try {
      const response = await fichesPaieAPI.validate(id)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'La validation a échoué.' })
      setBusy(false)
    }
  }

  const reject = async (id: number) => {
    const commentaire = window.prompt('Motif du refus (facultatif)') ?? ''
    setBusy(true)
    try {
      const response = await fichesPaieAPI.reject(id, commentaire)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Le refus a échoué.' })
    } finally {
      setBusy(false)
    }
  }

  const processAdvance = async (id: number, statut: 'Approuvée' | 'Refusée') => {
    setBusy(true)
    try {
      const response = await avancesPaieAPI.process(id, statut)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Le traitement de la demande a échoué.' })
      setBusy(false)
    }
  }

  const retryTransfer = async (id: number) => {
    setBusy(true)
    try {
      const response = await fichesPaieAPI.retryTransfer(id)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'La relance du virement a échoué.' })
      setBusy(false)
    }
  }

  const pendingSheets = fiches.filter(fiche => fiche.statut === 'À valider')
  const total = fiches.reduce((sum, fiche) => sum + Number(fiche.montant || 0), 0)
  const totalBase = fiches.reduce((sum, fiche) => sum + Number(fiche.salaire_base || 0), 0)
  const totalAvantages = fiches.reduce((sum, fiche) => sum + Number(fiche.total_avantages || 0), 0)
  const totalRetenues = fiches.reduce((sum, fiche) => sum + Number(fiche.retenues || 0) + Number(fiche.avance_deduite || 0), 0)
  const pendingAdvances = avances.filter(avance => avance.statut === 'En attente')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={busy} title="Actualiser" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {feedback && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="text-sm font-medium">{feedback.text}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[
          { label: 'Fiches générées', value: fiches.length, icon: FileText, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'À valider', value: pendingSheets.length, icon: Clock, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Salaires de base', value: money.format(totalBase), icon: DollarSign, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Avantages', value: money.format(totalAvantages), icon: Users, tone: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
          { label: 'Retenues + avances', value: money.format(totalRetenues), icon: Ban, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Masse nette', value: money.format(total), icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(stat => <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}><stat.icon className="h-5 w-5" /></div><p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p><p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p></div>)}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-slate-800 dark:text-white">Décisions à prendre</h2>
        </div>
        {pendingSheets.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune fiche en attente de validation.</p>
        ) : (
          <div className="space-y-3">
            {pendingSheets.map(fiche => (
              <div key={`decision-${fiche.id_paie}`} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{fiche.employe?.prenom ?? 'Employé'} {fiche.employe?.nom ?? fiche.matricule}</p>
                  <p className="text-sm text-slate-500">Net: {money.format(Number(fiche.montant))} · Base: {money.format(Number(fiche.salaire_base || 0))}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSelectedFiche(fiche)} className="inline-flex items-center gap-1 rounded-lg border border-teal-300 px-3 py-2 text-sm font-semibold text-teal-800 dark:text-teal-200"><Eye className="h-4 w-4" /> Détails</button>
                  <button type="button" onClick={() => void reject(fiche.id_paie)} disabled={busy} className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-40"><Ban className="h-4 w-4" /> Refuser</button>
                  <button type="button" onClick={() => void validate(fiche.id_paie)} disabled={busy || !fiche.payment_method} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Valider</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /><h2 className="font-bold text-slate-800 dark:text-white">Générer les brouillons mensuels</h2></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Mois<select value={month} onChange={event => setMonth(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
          <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Année<input type="number" value={year} min="2020" max="2100" onChange={event => setYear(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
          <button type="button" onClick={() => void generate()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Play className="h-4 w-4" /> Générer</button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-slate-700"><ShieldCheck className="h-5 w-5 text-teal-600" /><h2 className="font-bold text-slate-800 dark:text-white">Registre de contrôle</h2></div>
        {fiches.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucune fiche générée.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{fiches.map(fiche => <div key={fiche.id_paie} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">{fiche.employe?.prenom ?? 'Employé'} {fiche.employe?.nom ?? fiche.matricule}</p><p className="text-sm text-slate-500">{fiche.mois_paiement}/{fiche.annee_paiement} · Base {money.format(Number(fiche.salaire_base ?? 0))} + avantages {money.format(Number(fiche.total_avantages ?? 0))} - retenues {money.format(Number(fiche.retenues ?? 0))} - avance {money.format(Number(fiche.avance_deduite ?? 0))}</p><p className="mt-1 text-xs text-slate-500">{fiche.payment_method ? `${fiche.payment_method.type} · ${fiche.payment_method.masked_identifier}` : 'Moyen de paiement manquant'} · {fiche.payment_status || 'Non prêt'}</p></div><div className="flex flex-wrap items-center gap-3"><strong className="text-emerald-600">{money.format(Number(fiche.montant))}</strong><button type="button" onClick={() => setSelectedFiche(fiche)} className="inline-flex items-center gap-2 rounded-lg border border-teal-300 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 dark:text-teal-200"><Eye className="h-4 w-4" /> Détails</button><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{fiche.statut}</span>{fiche.statut === 'À valider' && <button type="button" onClick={() => void validate(fiche.id_paie)} disabled={busy || !fiche.payment_method} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy ? 'Traitement...' : 'Valider et virer'}</button>}{fiche.statut === 'Validée' && fiche.payment_status !== 'Payée' && <button type="button" onClick={() => void retryTransfer(fiche.id_paie)} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 disabled:opacity-60 dark:text-amber-200"><RotateCcw className="h-4 w-4" /> {busy ? 'Relance...' : 'Relancer'}</button>}</div></div>)}</div>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-slate-700"><Users className="h-5 w-5 text-amber-600" /><h2 className="font-bold text-slate-800 dark:text-white">Demandes d'avance ({pendingAdvances.length})</h2></div>
        {pendingAdvances.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucune demande d'avance en attente.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{pendingAdvances.map(avance => <div key={avance.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">{avance.employe?.prenom ?? avance.matricule} · {money.format(Number(avance.montant))}</p><p className="text-sm text-slate-500">{avance.motif}</p></div><div className="flex gap-2"><button type="button" onClick={() => void processAdvance(avance.id, 'Refusée')} disabled={busy} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">Refuser</button><button type="button" onClick={() => void processAdvance(avance.id, 'Approuvée')} disabled={busy} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Approuver</button></div></div>)}</div>}
      </section>

      {selectedFiche && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="payroll-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/30 bg-white/90 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/90"><header className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700"><div><p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Bulletin #{selectedFiche.id_paie}</p><h2 id="payroll-detail-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selectedFiche.employe?.prenom} {selectedFiche.employe?.nom}</h2><p className="mt-1 text-sm text-slate-500">{selectedFiche.matricule} · période {selectedFiche.mois_paiement}/{selectedFiche.annee_paiement}</p></div><button type="button" onClick={() => setSelectedFiche(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Fermer"><X className="h-5 w-5" /></button></header><div className="space-y-4 p-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[{ label: 'Salaire de base', value: money.format(Number(selectedFiche.salaire_base ?? 0)) }, { label: 'Avantages actifs', value: `+ ${money.format(Number(selectedFiche.total_avantages ?? 0))}` }, { label: 'Retenues d’absences', value: `- ${money.format(Number(selectedFiche.retenues ?? 0))}` }, { label: 'Avance déduite', value: `- ${money.format(Number(selectedFiche.avance_deduite ?? 0))}` }].map(item => <div key={item.label} className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/70"><p className="text-xs text-slate-500">{item.label}</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{item.value}</p></div>)}</div><div className="rounded-lg bg-teal-700 p-5 text-white"><p className="text-sm text-teal-100">Net à payer</p><p className="mt-1 text-3xl font-bold">{money.format(Number(selectedFiche.montant ?? 0))}</p></div><div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"><p><span className="text-slate-500">Statut bulletin :</span> <strong className="text-slate-900 dark:text-white">{selectedFiche.statut}</strong></p><p><span className="text-slate-500">Statut paiement :</span> <strong className="text-slate-900 dark:text-white">{selectedFiche.payment_status ?? 'Non prêt'}</strong></p><p><span className="text-slate-500">Moyen de paiement :</span> <strong className="text-slate-900 dark:text-white">{selectedFiche.payment_method ? `${selectedFiche.payment_method.type} · ${selectedFiche.payment_method.masked_identifier}` : 'Non renseigné'}</strong></p><p><span className="text-slate-500">Validée le :</span> <strong className="text-slate-900 dark:text-white">{selectedFiche.validee_at ? new Date(selectedFiche.validee_at).toLocaleString('fr-FR') : 'En attente'}</strong></p></div>{selectedFiche.payment_error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">Erreur de transfert : {selectedFiche.payment_error}</p>}</div></div></div>}
    </div>
  )
}
