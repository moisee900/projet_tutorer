import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileInvoice, faDollarSign, faCheckCircle,
  faCircleExclamation, faPaperPlane, faWallet, faCoins, faReceipt,
  faClock, faArrowRight, faCircle,
  faXmark, faHourglassHalf, faMoneyBillWave,
  faSpinner, faHistory
} from '@fortawesome/free-solid-svg-icons'
import { avancesPaieAPI, extractFichesPaie, fichesPaieAPI, type FichePaie } from '../../services/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const slideUp = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.96 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

export const EmployePaiePage = () => {
  const [fiches, setFiches] = useState<FichePaie[]>([])
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFiche, setSelectedFiche] = useState<FichePaie | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fichesPaieAPI.getMine()
      setFiches(extractFichesPaie(response))
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Impossible de charger vos fiches de paie.' 
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    await load()
    setIsRefreshing(false)
  }, [load])

  useEffect(() => { load() }, [load])

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const intervalId = setInterval(refresh, 60000)
    return () => clearInterval(intervalId)
  }, [refresh])

  const requestAdvance = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await avancesPaieAPI.request(Number(amount), reason)
      setFeedback({ type: 'success', text: response.message })
      setAmount('')
      setReason('')
      await refresh()
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Votre demande n\'a pas pu être enregistrée.' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const total = fiches.reduce((sum, fiche) => sum + Number(fiche.montant || 0), 0)
  const latest = fiches[0]
  const totalAvantages = fiches.reduce((sum, fiche) => sum + Number(fiche.total_avantages || 0), 0)

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Validée': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
      'Payée': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
      'payée': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
      'Générée': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
      'En attente': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
      'Annulée': 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    }
    return colors[statut] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  const getStatusIcon = (statut: string) => {
    const icons: Record<string, any> = {
      'Validée': faCheckCircle,
      'Payée': faCheckCircle,
      'payée': faCheckCircle,
      'Générée': faClock,
      'En attente': faHourglassHalf,
      'Annulée': faXmark,
    }
    return icons[statut] || faCircle
  }

  const statsCards = [
    { 
      label: 'Fiches disponibles', 
      value: fiches.length, 
      icon: faFileInvoice, 
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      label: 'Dernier net', 
      value: latest ? money.format(Number(latest.montant)) : '$0.00', 
      icon: faDollarSign, 
      color: '#10B981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    { 
      label: 'Cumul annuel', 
      value: money.format(total), 
      icon: faWallet, 
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    { 
      label: 'Avantages', 
      value: money.format(totalAvantages), 
      icon: faCoins, 
      color: '#8B5CF6',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30'
    },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-24"
    >
      {/* Header */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes fiches de paie</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Consultez vos fiches et gérez vos demandes d'avance
              </p>
            </div>
          </div>
          <button 
            onClick={refresh}
            disabled={isRefreshing || loading}
            className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <FontAwesomeIcon icon={faSpinner} className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#10B981]' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Reste du code identique ... */}
      {/* Feedback, Stats, Demande d'avance, Historique, Modal */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              feedback.type === 'success' 
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30' 
                : 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30'
            }`}
          >
            <FontAwesomeIcon 
              icon={feedback.type === 'success' ? faCheckCircle : faCircleExclamation} 
              className={`mt-0.5 w-5 h-5 ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} 
            />
            <p className="text-sm font-medium text-[#0F172A] dark:text-white">{feedback.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statsCards.map((stat, index) => (
          <motion.div 
            key={index}
            variants={slideUp}
            whileHover={{ y: -2 }}
            className={`${stat.bg} rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155] transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {stat.label}
              </p>
              <div className={`${stat.iconBg} w-8 h-8 rounded-lg flex items-center justify-center`}>
                <FontAwesomeIcon icon={stat.icon} className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#0F172A] dark:text-white">{stat.value}</p>
            <div className="w-full h-0.5 bg-[#E2E8F0] dark:bg-[#334155] rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: stat.color }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Demande d'avance */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F172A] dark:text-white">Demander une avance exceptionnelle</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Toute demande est examinée par le RH. Une avance approuvée est déduite de la fiche du mois.
            </p>
          </div>
        </div>

        <form onSubmit={requestAdvance} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <div>
            <label className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              Montant (USD)
              <input 
                type="number" 
                min="1" 
                step="0.01" 
                required 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3 py-2.5 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              Motif
              <textarea 
                required 
                minLength={10} 
                maxLength={2000} 
                rows={2} 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                className="mt-1 w-full resize-none rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3 py-2.5 text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                placeholder="Expliquez le motif de votre demande..."
              />
            </label>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={submitting} 
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-[#059669] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
            )}
            Envoyer
          </motion.button>
        </form>
      </motion.div>

      {/* Historique */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faHistory} className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <h2 className="font-semibold text-[#0F172A] dark:text-white">Historique des paies</h2>
          </div>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-1 rounded-full">
            {fiches.length} fiches
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement des fiches...</p>
          </div>
        ) : fiches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faFileInvoice} className="w-10 h-10 text-[#94A3B8] dark:text-[#475569] mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucune fiche de paie disponible</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {fiches.map((fiche, index) => {
              const StatusIcon = getStatusIcon(fiche.statut)
              const statusColor = getStatusColor(fiche.statut)
              return (
                <motion.div 
                  key={fiche.id_paie}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.04)' }}
                  onClick={() => setSelectedFiche(fiche)}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] dark:text-white text-sm">
                        {fiche.mois_paiement} {fiche.annee_paiement}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        <span>Salaire: {money.format(Number(fiche.salaire_base ?? 0))}</span>
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                        <span>Avance: {money.format(Number(fiche.avance_deduite ?? 0))}</span>
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                        <span>Réf: #{fiche.id_paie}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusColor}`}>
                      <FontAwesomeIcon icon={StatusIcon} className="w-3 h-3" />
                      {fiche.statut}
                    </span>
                    <span className="text-lg font-bold text-[#10B981]">
                      {money.format(Number(fiche.montant))}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedFiche && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedFiche(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">
                    Détails de la paie
                  </h3>
                </div>
                <button onClick={() => setSelectedFiche(null)} className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl">
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Montant net</p>
                  <p className="text-3xl font-bold text-[#10B981]">
                    {money.format(Number(selectedFiche.montant))}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Période', value: `${selectedFiche.mois_paiement}/${selectedFiche.annee_paiement}` },
                    { label: 'Statut', value: selectedFiche.statut },
                    { label: 'Salaire base', value: money.format(Number(selectedFiche.salaire_base ?? 0)) },
                    { label: 'Avantages', value: money.format(Number(selectedFiche.total_avantages ?? 0)) },
                    { label: 'Retenues', value: money.format(Number(selectedFiche.retenues ?? 0)) },
                    { label: 'Avance déduite', value: money.format(Number(selectedFiche.avance_deduite ?? 0)) },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg">
                      <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}