// Données mock Phase 7 - Modules nice-to-have

export interface Sondage {
  id: number
  titre: string
  description: string
  auteur: string
  date_creation: string
  date_fin: string
  statut: 'Actif' | 'Termine' | 'Brouillon'
  total_reponses: number
  questions: QuestionSondage[]
  categorie: string
}

export interface QuestionSondage {
  id: number
  question: string
  type: 'Choix unique' | 'Choix multiple' | 'Texte' | 'Echelle'
  options: string[]
  reponses?: number[]
}

export interface DefiBienEtre {
  id: number
  titre: string
  description: string
  categorie: 'Fitness' | 'Nutrition' | 'Mental' | 'Social' | 'Sommeil'
  date_debut: string
  date_fin: string
  participants: number
  progression_moyenne: number
  icone: string
  couleur: string
}

export interface RessourceBienEtre {
  id: number
  titre: string
  categorie: string
  type: 'Article' | 'Video' | 'Podcast' | 'Exercice'
  duree: string
  auteur: string
  image?: string
  likes: number
  vues: number
}

export interface ArticleKnowledgeBase {
  id: number
  titre: string
  categorie: string
  contenu: string
  auteur: string
  date_publication: string
  date_modification: string
  tags: string[]
  vues: number
  likes: number
  commentaires: number
  statut: 'Publie' | 'Brouillon' | 'Archive'
}

export interface CategorieKB {
  id: number
  nom: string
  icone: string
  couleur: string
  nombre_articles: number
  description: string
}

export interface BinomeMentorat {
  id: number
  mentor: string
  mentor_poste: string
  mentor_photo: string
  mentor_expertise: string[]
  mentore: string
  mentore_poste: string
  mentore_photo: string
  date_debut: string
  statut: 'Actif' | 'Termine' | 'En_pause'
  nombre_sessions: number
  prochaine_session?: string
  objectifs: string[]
}

export interface SessionMentorat {
  id: number
  binome_id: number
  date: string
  duree: string
  sujet: string
  notes: string
  statut: 'Planifiee' | 'Effectuee' | 'Annulee'
}

export interface Timesheet {
  id: number
  employe_id: string
  employe_nom: string
  semaine: string
  projets: ProjetTimesheet[]
  total_heures: number
  statut: 'Brouillon' | 'Soumise' | 'Approuvee' | 'Rejetee'
  date_soumission?: string
  date_approbation?: string
}

export interface ProjetTimesheet {
  id: number
  nom: string
  client: string
  taches: TacheTimesheet[]
  total_heures: number
}

export interface TacheTimesheet {
  id: number
  description: string
  heures: number
  date: string
}

export const mockSondages: Sondage[] = [
  {
    id: 1, titre: 'Satisfaction au travail 2026', description: 'Enquete annuelle sur la satisfaction des employes',
    auteur: 'Grace Mbuyi', date_creation: '2026-06-01', date_fin: '2026-06-30', statut: 'Actif', total_reponses: 45,
    categorie: 'RH',
    questions: [
      { id: 1, question: 'Comment evaluez-vous votre satisfaction globale ?', type: 'Echelle', options: ['1', '2', '3', '4', '5'], reponses: [2, 5, 12, 18, 8] },
      { id: 2, question: 'Quel aspect appreciez-vous le plus ?', type: 'Choix unique', options: ['Ambiance', 'Projets', 'Equipe', 'Management'], reponses: [15, 12, 10, 8] }
    ]
  },
  {
    id: 2, titre: 'Preferences Team Building', description: 'Choisissez vos activites preferees',
    auteur: 'Pierre Kabongo', date_creation: '2026-05-15', date_fin: '2026-05-31', statut: 'Termine', total_reponses: 38,
    categorie: 'Evenement',
    questions: [
      { id: 3, question: 'Quelle activite preferez-vous ?', type: 'Choix multiple', options: ['Sport', 'Culture', 'Gastronomie', 'Nature'], reponses: [22, 18, 25, 20] }
    ]
  },
  {
    id: 3, titre: 'Feedback Formation React', description: 'Votre avis sur la formation',
    auteur: 'Marie Tshimanga', date_creation: '2026-06-20', date_fin: '2026-07-05', statut: 'Actif', total_reponses: 12,
    categorie: 'Formation',
    questions: [
      { id: 4, question: 'Note de la formation', type: 'Echelle', options: ['1', '2', '3', '4', '5'], reponses: [0, 1, 2, 5, 4] }
    ]
  },
  {
    id: 4, titre: 'Idees Amelioration Bureau', description: 'Partagez vos idees',
    auteur: 'David Kasongo', date_creation: '2026-06-22', date_fin: '2026-07-15', statut: 'Brouillon', total_reponses: 0,
    categorie: 'General',
    questions: []
  }
]

export const mockDefisBienEtre: DefiBienEtre[] = [
  { id: 1, titre: '10 000 pas par jour', description: 'Marchez 10 000 pas chaque jour pendant 30 jours', categorie: 'Fitness', date_debut: '2026-06-01', date_fin: '2026-06-30', participants: 28, progression_moyenne: 75, icone: '🚶', couleur: 'from-primary-500 to-primary-500' },
  { id: 2, titre: 'Zero sucre', description: 'Eliminez le sucre ajoute pendant 21 jours', categorie: 'Nutrition', date_debut: '2026-06-10', date_fin: '2026-06-30', participants: 15, progression_moyenne: 60, icone: '🥗', couleur: 'from-primary-500 to-primary-500' },
  { id: 3, titre: 'Meditation quotidienne', description: '10 minutes de meditation par jour', categorie: 'Mental', date_debut: '2026-06-15', date_fin: '2026-07-15', participants: 22, progression_moyenne: 80, icone: '🧘', couleur: 'from-primary-500 to-primary-500' },
  { id: 4, titre: '8h de sommeil', description: 'Dormir 8 heures chaque nuit', categorie: 'Sommeil', date_debut: '2026-06-20', date_fin: '2026-07-20', participants: 18, progression_moyenne: 55, icone: '😴', couleur: 'from-primary-500 to-primary-500' },
  { id: 5, titre: 'Dejeuner avec collegue', description: 'Un dejeuner avec un collegue different chaque semaine', categorie: 'Social', date_debut: '2026-06-01', date_fin: '2026-06-30', participants: 32, progression_moyenne: 85, icone: '👥', couleur: 'from-red-500 to-primary-500' },
  { id: 6, titre: 'Boire 2L d\'eau', description: 'Hydratez-vous correctement', categorie: 'Nutrition', date_debut: '2026-06-15', date_fin: '2026-07-15', participants: 40, progression_moyenne: 70, icone: '💧', couleur: 'from-cyan-500 to-primary-500' }
]

export const mockRessourcesBienEtre: RessourceBienEtre[] = [
  { id: 1, titre: 'Gerer le stress au travail', categorie: 'Mental', type: 'Article', duree: '10 min', auteur: 'Dr. Mukendi', likes: 45, vues: 234 },
  { id: 2, titre: 'Yoga pour debutants', categorie: 'Fitness', type: 'Video', duree: '30 min', auteur: 'Sophie Laurent', likes: 89, vues: 567 },
  { id: 3, titre: 'Nutrition equilibree', categorie: 'Nutrition', type: 'Podcast', duree: '45 min', auteur: 'Chef Martin', likes: 34, vues: 189 },
  { id: 4, titre: 'Exercices de bureau', categorie: 'Fitness', type: 'Exercice', duree: '15 min', auteur: 'Coach Jean', likes: 67, vues: 345 },
  { id: 5, titre: 'Meditation guidee', categorie: 'Mental', type: 'Video', duree: '20 min', auteur: 'Zen Master', likes: 123, vues: 789 },
  { id: 6, titre: 'Ameliorer son sommeil', categorie: 'Sommeil', type: 'Article', duree: '8 min', auteur: 'Dr. Sommeil', likes: 56, vues: 298 }
]

export const mockArticlesKB: ArticleKnowledgeBase[] = [
  { id: 1, titre: 'Comment demander un conge', categorie: 'RH', contenu: 'Guide complet pour demander un conge dans le systeme...', auteur: 'Grace Mbuyi', date_publication: '2026-01-15', date_modification: '2026-06-20', tags: ['conge', 'rh', 'processus'], vues: 456, likes: 34, commentaires: 12, statut: 'Publie' },
  { id: 2, titre: 'Utilisation du portail employe', categorie: 'Technique', contenu: 'Tutoriel complet du portail employe...', auteur: 'David Kasongo', date_publication: '2026-02-10', date_modification: '2026-06-15', tags: ['portail', 'tutorial', 'employe'], vues: 678, likes: 45, commentaires: 18, statut: 'Publie' },
  { id: 3, titre: 'Politique de teletravail', categorie: 'RH', contenu: 'Toutes les informations sur le teletravail...', auteur: 'Pierre Kabongo', date_publication: '2026-03-05', date_modification: '2026-06-10', tags: ['teletravail', 'politique'], vues: 892, likes: 67, commentaires: 23, statut: 'Publie' },
  { id: 4, titre: 'Guide des notes de frais', categorie: 'Finance', contenu: 'Comment soumettre une note de frais...', auteur: 'Finance Team', date_publication: '2026-04-12', date_modification: '2026-06-01', tags: ['finance', 'frais', 'remboursement'], vues: 234, likes: 18, commentaires: 8, statut: 'Publie' },
  { id: 5, titre: 'Onboarding nouveau collaborateur', categorie: 'RH', contenu: 'Checklist complete pour les nouveaux...', auteur: 'Grace Mbuyi', date_publication: '2026-05-20', date_modification: '2026-06-25', tags: ['onboarding', 'nouveau', 'checklist'], vues: 156, likes: 22, commentaires: 6, statut: 'Publie' },
  { id: 6, titre: 'Securite informatique', categorie: 'Technique', contenu: 'Bonnes pratiques de securite...', auteur: 'IT Security', date_publication: '2026-06-01', date_modification: '2026-06-25', tags: ['securite', 'it', 'bonnes-pratiques'], vues: 345, likes: 28, commentaires: 11, statut: 'Publie' }
]

export const mockCategoriesKB: CategorieKB[] = [
  { id: 1, nom: 'RH', icone: '👥', couleur: 'from-primary-500 to-primary-500', nombre_articles: 45, description: 'Ressources humaines et processus' },
  { id: 2, nom: 'Technique', icone: '💻', couleur: 'from-primary-500 to-cyan-500', nombre_articles: 32, description: 'Documentation technique' },
  { id: 3, nom: 'Finance', icone: '💰', couleur: 'from-primary-500 to-primary-500', nombre_articles: 18, description: 'Processus financiers' },
  { id: 4, nom: 'Management', icone: '🎯', couleur: 'from-primary-500 to-primary-500', nombre_articles: 24, description: 'Management et leadership' },
  { id: 5, nom: 'Bien-etre', icone: '💚', couleur: 'from-primary-500 to-primary-500', nombre_articles: 15, description: 'Bien-etre au travail' },
  { id: 6, nom: 'Formation', icone: '📚', couleur: 'from-primary-500 to-primary-500', nombre_articles: 28, description: 'Formations et certifications' }
]

export const mockBinomesMentorat: BinomeMentorat[] = [
  { id: 1, mentor: 'Pierre Kabongo', mentor_poste: 'Directeur Finance', mentor_photo: 'PK', mentor_expertise: ['Finance', 'Management', 'Strategie'], mentore: 'Alice Mukendi', mentore_poste: 'Comptable Junior', mentore_photo: 'AM', date_debut: '2026-03-01', statut: 'Actif', nombre_sessions: 8, prochaine_session: '2026-06-28', objectifs: ['Developper competences comptables', 'Preparer promotion'] },
  { id: 2, mentor: 'David Kasongo', mentor_poste: 'Lead Developpeur', mentor_photo: 'DK', mentor_expertise: ['React', 'Architecture', 'DevOps'], mentore: 'Jean Ilunga', mentore_poste: 'Developpeur Junior', mentore_photo: 'JI', date_debut: '2026-04-15', statut: 'Actif', nombre_sessions: 6, prochaine_session: '2026-06-30', objectifs: ['Maitriser React', 'Comprendre architecture'] },
  { id: 3, mentor: 'Grace Mbuyi', mentor_poste: 'Responsable RH', mentor_photo: 'GM', mentor_expertise: ['RH', 'Recrutement', 'Droit du travail'], mentore: 'Marie Tshimanga', mentore_poste: 'Assistante RH', mentore_photo: 'MT', date_debut: '2026-02-01', statut: 'Termine', nombre_sessions: 12, objectifs: ['Transition vers RH', 'Certification RH'] },
  { id: 4, mentor: 'Moise Vita', mentor_poste: 'Directeur General', mentor_photo: 'MV', mentor_expertise: ['Leadership', 'Strategie', 'Business'], mentore: 'Pierre Kabongo', mentore_poste: 'Directeur Finance', mentore_photo: 'PK', date_debut: '2026-05-01', statut: 'Actif', nombre_sessions: 4, prochaine_session: '2026-07-05', objectifs: ['Leadership executif', 'Vision strategique'] }
]

export const mockTimesheets: Timesheet[] = [
  {
    id: 1, employe_id: 'EMP-001', employe_nom: 'Moise Vita', semaine: '24-30 Juin 2026', statut: 'Brouillon', total_heures: 32,
    projets: [
      { id: 1, nom: 'Projet RH Manager', client: 'Interne', total_heures: 20, taches: [
        { id: 1, description: 'Revue architecture', heures: 8, date: '2026-06-24' },
        { id: 2, description: 'Reunions equipe', heures: 12, date: '2026-06-25' }
      ]},
      { id: 2, nom: 'Formation React', client: 'Interne', total_heures: 12, taches: [
        { id: 3, description: 'Cours en ligne', heures: 12, date: '2026-06-26' }
      ]}
    ]
  },
  {
    id: 2, employe_id: 'EMP-003', employe_nom: 'David Kasongo', semaine: '24-30 Juin 2026', statut: 'Soumise', total_heures: 40,
    date_soumission: '2026-06-30',
    projets: [
      { id: 3, nom: 'Projet RH Manager', client: 'Interne', total_heures: 30, taches: [
        { id: 4, description: 'Developpement frontend', heures: 20, date: '2026-06-24' },
        { id: 5, description: 'Code review', heures: 10, date: '2026-06-25' }
      ]},
      { id: 4, nom: 'Support Client', client: 'VitaService', total_heures: 10, taches: [
        { id: 6, description: 'Resolution bugs', heures: 10, date: '2026-06-26' }
      ]}
    ]
  },
  {
    id: 3, employe_id: 'EMP-005', employe_nom: 'Marie Tshimanga', semaine: '17-23 Juin 2026', statut: 'Approuvee', total_heures: 38,
    date_soumission: '2026-06-23', date_approbation: '2026-06-24',
    projets: [
      { id: 5, nom: 'Projet RH Manager', client: 'Interne', total_heures: 38, taches: [
        { id: 7, description: 'Integration API', heures: 25, date: '2026-06-17' },
        { id: 8, description: 'Tests unitaires', heures: 13, date: '2026-06-20' }
      ]}
    ]
  },
  {
    id: 4, employe_id: 'EMP-006', employe_nom: 'Jean Ilunga', semaine: '17-23 Juin 2026', statut: 'Rejetee', total_heures: 45,
    date_soumission: '2026-06-23',
    projets: [
      { id: 6, nom: 'Projet RH Manager', client: 'Interne', total_heures: 45, taches: [
        { id: 9, description: 'Developpement backend', heures: 45, date: '2026-06-20' }
      ]}
    ]
  }
]