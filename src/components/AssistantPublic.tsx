import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, HelpCircle, BookOpen, Briefcase, Users, ChevronRight } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  suggestions?: string[]
}

const responses: Record<string, { text: string; suggestions?: string[] }> = {
  'bonjour': { text: 'Bonjour ! 👋 Bienvenue sur RH MANAGER. Comment puis-je vous aider aujourd\'hui ?', suggestions: ['Voir les offres', 'Créer un compte', 'Fonctionnalités'] },
  'salut': { text: 'Salut ! 😊 Ravi de vous voir. Que souhaitez-vous savoir ?', suggestions: ['Offres d\'emploi', 'S\'inscrire', 'Tarifs'] },
  'offres': { text: 'Nous avons plusieurs offres d\'emploi disponibles ! Vous pouvez les consulter sur la page /offres. Nos entreprises partenaires recrutent activement. 🎯', suggestions: ['Voir les offres', 'Comment postuler', 'Types de contrats'] },
  'postuler': { text: 'Pour postuler à une offre : 1️⃣ Consultez les offres sur /offres 2️⃣ Cliquez sur une offre 3️⃣ Remplissez le formulaire de candidature 4️⃣ Attendez la réponse du recruteur. Bonne chance ! 🍀', suggestions: ['Documents requis', 'Délai de réponse', 'Autres questions'] },
  'inscription': { text: 'Pour créer un compte : Cliquez sur "S\'inscrire" en haut à droite. Choisissez votre rôle (Utilisateur ou Directeur). Remplissez vos informations. C\'est gratuit ! ✅', suggestions: ['Rôles disponibles', 'Mot de passe oublié', 'Support'] },
  'compte': { text: 'Vous pouvez créer deux types de comptes : 👤 Utilisateur (pour postuler aux offres) ou 👔 Directeur (pour créer et gérer une entreprise). Lequel vous intéresse ?', suggestions: ['Devenir utilisateur', 'Devenir directeur', 'Comparaison'] },
  'directeur': { text: 'En tant que Directeur, vous pouvez : 🏢 Créer votre entreprise, 📝 Publier des offres d\'emploi, 👥 Gérer vos employés, 📊 Consulter des statistiques avancées. Intéressé ?', suggestions: ['Créer entreprise', 'Fonctionnalités', 'Tarifs'] },
  'fonctionnalites': { text: 'RH Manager offre : ✅ Gestion complète du personnel, ✅ Recrutement et candidatures, ✅ Paie automatisée, ✅ Évaluations de performance, ✅ Formations, ✅ Messagerie interne, ✅ Archivage sécurisé, et bien plus ! 🚀', suggestions: ['Détails paie', 'Évaluations', 'Messagerie'] },
  'paie': { text: 'Notre module de paie inclut : 💰 Génération automatique des bulletins, 📊 Calcul des cotisations, 📄 Export comptable, ⏰ Gestion des heures supplémentaires, 🎁 Primes et avantages. Tout est automatisé !', suggestions: ['Démonstration', 'Tarifs', 'Support'] },
  'securite': { text: 'La sécurité est notre priorité : 🔒 Chiffrement AES-256, ✅ Signature électronique eIDAS, 📋 Audit logs complets, 🔐 Authentification 2FA, 🛡️ Conformité RGPD. Vos données sont protégées !', suggestions: ['RGPD', '2FA', 'Certifications'] },
  'support': { text: 'Notre équipe support est disponible : 📧 Email : support@rhpro.com, 📞 Téléphone : +243 988 401 637, 💬 Chat en direct (cette fenêtre !), 📚 Base de connaissances : /kb. Nous répondons sous 24h !', suggestions: ['Contact direct', 'FAQ', 'Documentation'] },
  'prix': { text: 'Nos tarifs : 🆓 Gratuit pour les candidats, 💼 Directeur : 50$/mois par entreprise, 🏢 Entreprise : 200$/mois (illimité employes), 🌟 Premium : 500$/mois (toutes fonctionnalités). Contactez-nous pour un devis personnalisé !', suggestions: ['Essai gratuit', 'Démonstration', 'Contact commercial'] },
  'merci': { text: 'Avec plaisir ! 😊 N\'hésitez pas si vous avez d\'autres questions. Bonne journée sur RH Manager ! 🌟', suggestions: ['Autre question', 'Voir offres', 'Accueil'] },
  'default': { text: 'Je suis là pour vous aider ! 🤔 Pouvez-vous reformuler votre question ? Je peux vous renseigner sur : les offres d\'emploi, l\'inscription, les fonctionnalités, la paie, la sécurité, ou le support.', suggestions: ['Offres d\'emploi', 'Fonctionnalités', 'Support', 'Tarifs'] }
};

export const AssistantPublic = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Bonjour ! 👋 Je suis l\'assistant RH Manager. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Voir les offres', 'Créer un compte', 'Fonctionnalités', 'Support']
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const lower = userMessage.toLowerCase()
    for (const key in responses) {
      if (key !== 'default' && lower.includes(key)) {
        return responses[key]
      }
    }
    return responses['default']
  }

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(messageText)
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const quickQuestions = [
    { icon: Briefcase, label: 'Offres d\'emploi', query: 'offres' },
    { icon: Users, label: 'Créer un compte', query: 'inscription' },
    { icon: Sparkles, label: 'Fonctionnalités', query: 'fonctionnalites' },
    { icon: HelpCircle, label: 'Support', query: 'support' }
  ]

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-slate-700 dark:bg-slate-600 rotate-90' 
            : 'bg-gradient-to-br from-primary-500 via-orange-500 to-red-500 animate-pulse'
        }`}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-ping" />
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-500 via-orange-500 to-red-500 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative flex items-center space-x-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Bot className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Assistant RH Manager</h3>
                <div className="flex items-center space-x-2 text-sm text-white/90">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                  <div className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                        : 'bg-gradient-to-br from-primary-500 to-primary-500'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm rounded-bl-sm border border-slate-200 dark:border-slate-700'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  {msg.suggestions && msg.sender === 'bot' && (
                    <div className="mt-2 ml-10 flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center space-x-1"
                        >
                          <span>{suggestion}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length <= 1 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Questions populaires :</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.query)}
                    className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left"
                  >
                    <q.icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
              Propulsé par RH Manager • Répond instantanément
            </p>
          </div>
        </div>
      )}
    </>
  )
}