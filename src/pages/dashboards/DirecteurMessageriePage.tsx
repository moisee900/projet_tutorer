import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { 
  ArrowLeft, Check, CheckCheck, MapPin, Phone, Search, Send, Video, X,
  UserPlus, User, Shield, Users as UsersGroup, MessageSquare,
  MoreVertical, Plus, Trash2, Bell, BellOff,
  Mic, MicOff, Camera, CameraOff,
  Smile, Paperclip, Reply, Copy,
  LoaderCircle
} from 'lucide-react'
import { conversationAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

type Participant = {
  id: number
  name: string
  prenom: string
  nom: string
  email?: string
  statut?: 'online' | 'offline' | 'away' | 'busy'
  last_seen?: string
}

type Conversation = {
  id: number
  type: 'private' | 'group' | 'rh_service'
  name: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  participants: Participant[]
  is_rh_service: boolean
  is_pinned?: boolean
  is_muted?: boolean
  created_at: string
}

type Message = {
  id: number
  user_id: number
  body: string
  read_at: string | null
  created_at: string
  user?: {
    id: number
    name: string
    prenom: string
    nom: string
  }
  is_edited?: boolean
  is_deleted?: boolean
  reply_to?: number
}

type Contact = {
  id: number
  name: string
  prenom: string
  nom: string
  email: string
  matricule?: string
  poste?: string
  statut?: string
  last_seen?: string
  is_online?: boolean
}

type RhUser = {
  id: number
  name: string
  prenom: string
  nom: string
  email: string
}

type TypingIndicator = {
  conversationId: number
  userId: number
  userName: string
}

const initials = (firstName: string, lastName: string) => 
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

const formatMessageDate = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (isToday(date)) return format(date, 'HH:mm', { locale: fr })
  if (isYesterday(date)) return `Hier à ${format(date, 'HH:mm', { locale: fr })}`
  if (isThisWeek(date)) return format(date, 'EEEE à HH:mm', { locale: fr })
  return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr })
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'online': return 'bg-emerald-500'
    case 'away': return 'bg-amber-500'
    case 'busy': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
}

const MessageBubble = ({ 
  message, 
  isOwn, 
  onDelete, 
  onReply 
}: { 
  message: Message, 
  isOwn: boolean, 
  onDelete: (id: number) => void,
  onReply: (id: number) => void 
}) => {
  const [showActions, setShowActions] = useState(false)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && message.user && (
        <div className="flex items-start mr-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials(message.user.prenom || '', message.user.nom || '')}
          </div>
        </div>
      )}
      
      <div className={`max-w-[75%] ${!isOwn ? 'ml-0' : ''}`}>
        {!isOwn && message.user && (
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1">
            {message.user.prenom} {message.user.nom}
          </p>
        )}
        
        <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
          isOwn 
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none' 
            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-600'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
          <div className={`flex justify-end items-center gap-1 mt-1 text-[10px] ${
            isOwn ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
          }`}>
            <span>{formatMessageDate(message.created_at)}</span>
            {isOwn && (message.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
          </div>
        </div>
        
        <AnimatePresence>
          {showActions && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute top-0 ${isOwn ? 'right-0 -translate-y-1/2' : 'left-0 -translate-y-1/2'} flex gap-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 p-1`}
            >
              {isOwn && (
                <button 
                  onClick={() => onDelete(message.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                onClick={() => onReply(message.id)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full text-blue-500 transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(message.body)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const DirecteurMessageriePage = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [feedback, setFeedback] = useState('')
  const [sharingLocation, setSharingLocation] = useState(false)
  const [callMode, setCallMode] = useState<'audio' | 'video' | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'private' | 'group' | 'rh_service'>('all')
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const userStr = localStorage.getItem('user')
    try {
      const user = userStr ? JSON.parse(userStr) : null
      return user?.id || 0
    } catch {
      return 0
    }
  })
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      const response = await conversationAPI.getConversations()
      setConversations(response.conversations || [])
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    }
  }, [])

  const loadContacts = useCallback(async () => {
    try {
      const response = await conversationAPI.getContacts()
      setContacts(response.contacts || [])
    } catch (error) {
      console.error('Erreur chargement contacts:', error)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const response = await conversationAPI.getMessages(conversationId)
      setMessages(response.messages || [])
      await loadConversations()
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }, [loadConversations])

  useEffect(() => {
    void Promise.all([loadContacts(), loadConversations()])
  }, [loadContacts, loadConversations])

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
    if (selectedConversation) {
      void loadMessages(selectedConversation.id)
      setReplyTo(null)
    }
  }, [selectedConversation, loadMessages])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadConversations()
      if (selectedConversationRef.current) {
        void loadMessages(selectedConversationRef.current.id)
      }
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [loadConversations, loadMessages])

  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [selectedConversation])

  const handleTyping = (value: string) => {
    setNewMessage(value)
    setIsTyping(value.length > 0)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversation && value.length > 0) {
      }
    }, 500)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    const messageText = newMessage.trim()
    setNewMessage('')
    setIsTyping(false)
    
    try {
      await conversationAPI.sendMessage(selectedConversation.id, messageText)
      setReplyTo(null)
      await loadMessages(selectedConversation.id)
      await loadConversations()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Message non envoyé.')
      setNewMessage(messageText)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!window.confirm('Supprimer ce message ? Cette action est irréversible.')) return
    try {
      await conversationAPI.deleteMessage(messageId)
      await loadMessages(selectedConversation!.id)
      setFeedback('✅ Message supprimé')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de supprimer le message.')
    }
  }

  const openPrivateConversation = async (contact: Contact) => {
    try {
      setIsLoading(true)
      const response = await conversationAPI.createConversation(contact.id)
      await loadConversations()
      
      const conv = conversations.find(c => c.id === response.conversation.id)
      if (conv) {
        setSelectedConversation(conv)
      } else {
        await loadConversations()
        const found = conversations.find(c => c.id === response.conversation.id)
        if (found) setSelectedConversation(found)
      }
      setFeedback('💬 Conversation privée ouverte !')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d\'ouvrir la conversation.')
    } finally {
      setIsLoading(false)
    }
  }

  const createRhServiceConversation = async () => {
    try {
      setIsLoading(true)
      const response = await conversationAPI.createRhServiceConversation()
      await loadConversations()
      const conv = conversations.find(c => c.id === response.conversation.id)
      if (conv) setSelectedConversation(conv)
      setFeedback('✅ Conversation avec le service RH créée !')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de créer la conversation RH.')
    } finally {
      setIsLoading(false)
    }
  }

  const createGroupConversation = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      setFeedback('❌ Nom du groupe et participants requis.')
      return
    }

    try {
      setIsLoading(true)
      await conversationAPI.createGroupConversation(selectedParticipants, groupName)
      setShowNewGroupModal(false)
      setGroupName('')
      setSelectedParticipants([])
      await loadConversations()
      setFeedback('✅ Groupe créé avec succès !')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de créer le groupe.')
    } finally {
      setIsLoading(false)
    }
  }

  const startCall = async (mode: 'audio' | 'video') => {
    if (!selectedConversation) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: mode === 'video' 
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setCallMode(mode)
      
      setFeedback(`📞 Appel ${mode === 'video' ? 'vidéo' : 'audio'} en cours...`)
    } catch (error) {
      setFeedback('❌ Impossible de démarrer l\'appel. Vérifiez vos autorisations.')
      endCall(false)
    }
  }

  const endCall = (notify = true) => {
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    setRemoteStream(null)
    setCallMode(null)
    setIsCameraOn(true)
    setIsMicOn(true)
  }

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMicOn(!isMicOn)
    }
  }

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsCameraOn(!isCameraOn)
    }
  }

  const filteredConversations = useMemo(() => {
    let filtered = conversations
    
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.participants.some(p => 
          `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    return filtered.sort((a, b) => {
      return new Date(b.last_message_at || b.created_at).getTime() - 
             new Date(a.last_message_at || a.created_at).getTime()
    })
  }, [conversations, filterType, searchTerm])

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [contacts, searchTerm])

  return (
    <div className="space-y-6 h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
            Messagerie sécurisée
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Échanges privés, groupes et service RH — Sécurisé par entreprise
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRhServiceConversation}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all disabled:opacity-60"
          >
            <Shield className="w-4 h-4" />
            Service RH
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewGroupModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all"
          >
            <UsersGroup className="w-4 h-4" />
            Nouveau groupe
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}} 
            disabled={sharingLocation} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-60"
          >
            <MapPin className="w-4 h-4" />
            {sharingLocation ? 'Partage...' : 'Partager position'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-xl text-sm flex items-center justify-between ${
              feedback.includes('✅') || feedback.includes('📞') || feedback.includes('💬')
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : feedback.includes('❌')
                ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <span>{feedback}</span>
            <button onClick={() => setFeedback('')} className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl overflow-hidden h-[calc(100vh-280px)] min-h-[520px]">
        <div className="flex h-full">
          <aside className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Rechercher un contact..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm" 
                />
              </div>
              
              <div className="flex gap-1 flex-wrap">
                {(['all', 'private', 'group', 'rh_service'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === type
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {type === 'all' ? 'Tous' : 
                     type === 'private' ? 'Privés' : 
                     type === 'group' ? 'Groupes' : 'RH'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                    Contacts disponibles
                  </p>
                  {filteredContacts.map((contact) => {
                    const existingConv = conversations.find(c => 
                      c.type === 'private' && 
                      c.participants.some(p => p.id === contact.id)
                    )
                    
                    return (
                      <motion.button
                        key={contact.id}
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                        onClick={() => {
                          if (existingConv) {
                            setSelectedConversation(existingConv)
                          } else {
                            void openPrivateConversation(contact)
                          }
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center shadow-md flex-shrink-0">
                            {initials(contact.prenom, contact.nom)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-white truncate">
                                {contact.prenom} {contact.nom}
                              </span>
                              {existingConv && existingConv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                  {existingConv.unread_count > 9 ? '9+' : existingConv.unread_count}
                                </span>
                              )}
                              {!existingConv && (
                                <span className="text-[10px] text-primary-500 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {contact.poste || 'Collaborateur'}
                              </span>
                              {contact.is_online && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {filteredConversations.length > 0 && (
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                    Conversations
                  </p>
                  {filteredConversations.map((conv) => {
                    if (conv.type === 'private') {
                      const otherUser = conv.participants.find(p => p.id !== currentUserId)
                      const isInContacts = contacts.some(c => c.id === otherUser?.id)
                      if (isInContacts) return null
                    }
                    
                    const Icon = conv.type === 'rh_service' ? Shield : 
                                conv.type === 'group' ? UsersGroup : User
                    const color = conv.type === 'rh_service' ? 'from-amber-500 to-orange-500' :
                                 conv.type === 'group' ? 'from-violet-500 to-purple-500' :
                                 'from-emerald-500 to-teal-500'
                    
                    const displayName = conv.type === 'private' 
                      ? conv.participants.find(p => p.id !== currentUserId)?.prenom + ' ' + 
                        conv.participants.find(p => p.id !== currentUserId)?.nom
                      : conv.name
                    
                    return (
                      <motion.button
                        key={conv.id}
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                          selectedConversation?.id === conv.id 
                            ? 'bg-primary-50 dark:bg-primary-900/20' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white font-bold flex items-center justify-center shadow-md flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-white truncate">
                                {displayName}
                              </span>
                              {conv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                  {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {conv.last_message || 'Démarrer une conversation'}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: fr }) : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {filteredContacts.length === 0 && filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun contact disponible</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {searchTerm ? 'Aucun résultat pour votre recherche' : 'Les contacts de votre entreprise apparaîtront ici'}
                  </p>
                </div>
              )}
            </div>
          </aside>

          <main className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => setSelectedConversation(null)} 
                      className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                      selectedConversation.type === 'rh_service' ? 'from-amber-500 to-orange-500' :
                      selectedConversation.type === 'group' ? 'from-violet-500 to-purple-500' :
                      'from-emerald-500 to-teal-500'
                    } text-white font-bold flex items-center justify-center shadow-md flex-shrink-0`}>
                      {selectedConversation.type === 'rh_service' ? (
                        <Shield className="w-5 h-5" />
                      ) : selectedConversation.type === 'group' ? (
                        <UsersGroup className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">
                        {selectedConversation.type === 'private' 
                          ? selectedConversation.participants.find(p => p.id !== currentUserId)?.prenom + ' ' + 
                            selectedConversation.participants.find(p => p.id !== currentUserId)?.nom
                          : selectedConversation.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {selectedConversation.type === 'private' ? 'Conversation privée' : 
                         selectedConversation.type === 'group' ? `${selectedConversation.participants.length} participants` : 
                         'Service RH'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Notifications"
                    >
                      {isMuted ? <BellOff className="w-4 h-4 text-slate-500" /> : <Bell className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button 
                      onClick={() => void startCall('audio')} 
                      className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600"
                      title="Appel audio"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => void startCall('video')} 
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600"
                      title="Appel vidéo"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    {selectedConversation.type === 'group' && (
                      <button 
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Ajouter un participant"
                      >
                        <UserPlus className="w-4 h-4 text-slate-500" />
                      </button>
                    )}
                    <button 
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Plus d'options"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </header>

                <AnimatePresence>
                  {callMode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900 p-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {callMode === 'video' && (
                          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">Vous</span>
                            <button 
                              onClick={toggleCamera}
                              className={`absolute top-2 left-2 p-2 rounded-lg ${
                                isCameraOn ? 'bg-black/50 hover:bg-black/70' : 'bg-red-500 hover:bg-red-600'
                              } text-white transition-colors`}
                            >
                              {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                        {callMode === 'video' && (
                          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">Interlocuteur</span>
                          </div>
                        )}
                        {callMode === 'audio' && (
                          <div className="flex flex-col items-center justify-center bg-slate-800 rounded-xl p-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Phone className="w-10 h-10 text-emerald-400" />
                            </div>
                            <p className="text-white mt-4 font-semibold">Appel audio en cours</p>
                            <p className="text-slate-400 text-sm">{selectedConversation.name}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={toggleMic}
                            className={`p-3 rounded-full ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                          >
                            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => endCall()} 
                            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/30"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Aucun message</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">Soyez le premier à envoyer un message</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.user_id === currentUserId
                      return (
                        <MessageBubble 
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          onDelete={deleteMessage}
                          onReply={(id) => setReplyTo(id)}
                        />
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  {replyTo && (
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mb-2">
                      <div className="flex items-center gap-2">
                        <Reply className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Réponse à un message
                        </span>
                      </div>
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <button 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Smile className="w-5 h-5 text-slate-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5 text-slate-500" />
                    </button>
                    <input 
                      ref={inputRef}
                      value={newMessage} 
                      onChange={(e) => handleTyping(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          void sendMessage()
                        }
                      }} 
                      placeholder="Écrire un message..." 
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm resize-none" 
                    />
                    <button 
                      onClick={() => void sendMessage()} 
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {isTyping && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>En train d'écrire...</span>
                    </div>
                  )}
                </footer>
              </>
            ) : (
              <div className="flex-1 grid place-items-center p-6 text-center">
                <div>
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <MessageSquare className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Messagerie sécurisée</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Sélectionnez un contact ou une conversation pour commencer à échanger en toute sécurité.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                      <LockIcon className="w-4 h-4" /> Chiffré
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      <Shield className="w-4 h-4" /> Sécurisé
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm">
                      <UsersGroup className="w-4 h-4" /> Collaboration
                    </span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showNewGroupModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => setShowNewGroupModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UsersGroup className="w-5 h-5 text-violet-500" />
                  Nouveau groupe
                </h2>
                <button onClick={() => setShowNewGroupModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Nom du groupe *
                  </label>
                  <input 
                    type="text" 
                    value={groupName} 
                    onChange={(e) => setGroupName(e.target.value)} 
                    placeholder="Équipe Marketing" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-sm" 
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Participants * ({selectedParticipants.length} sélectionnés)
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2">
                    {contacts.filter(c => c.id !== currentUserId).map((contact) => (
                      <label 
                        key={contact.id} 
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          selectedParticipants.includes(contact.id) 
                            ? 'bg-violet-50 dark:bg-violet-950/30 border-2 border-violet-300 dark:border-violet-700' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border-2 border-transparent'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedParticipants.includes(contact.id)}
                          onChange={() => {
                            setSelectedParticipants(prev => 
                              prev.includes(contact.id) 
                                ? prev.filter(id => id !== contact.id)
                                : [...prev, contact.id]
                            )
                          }}
                          className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                        />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {initials(contact.prenom, contact.nom)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {contact.prenom} {contact.nom}
                        </span>
                        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                          {contact.poste || 'Collaborateur'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setShowNewGroupModal(false)} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={createGroupConversation} 
                    disabled={isLoading || !groupName.trim() || selectedParticipants.length === 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Créer le groupe
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-thumb { background: #475569; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .animate-bounce {
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const LockIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)