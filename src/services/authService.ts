// authService.ts - CORRECTION

import { authAPI } from './api';

export interface User {
  id: number;
  nom: string;
  post_nom?: string;
  prenom: string;
  name: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut: string;
  id_entreprise?: number | null;
  created_at?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
  errors?: Record<string, string[]>;
  redirect?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success === false) {
        return { 
          success: false, 
          message: response.message || 'Email ou mot de passe incorrect' 
        };
      }
      
      const user = response.user as User | undefined;
      if (!response.token || !user) {
        return { 
          success: false, 
          message: response.message || 'Réponse serveur invalide' 
        };
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      
      return { 
        success: true, 
        user, 
        token: response.token,
        message: response.message || 'Connexion réussie'
      };
    } catch (error: any) {
      // Gestion des erreurs 422
      if (error.status === 422 && error.errors) {
        return { 
          success: false, 
          message: error.message || 'Erreur de validation',
          errors: error.errors
        };
      }
      
      if (error.response?.data?.errors) {
        return { 
          success: false, 
          message: 'Erreur de validation',
          errors: error.response.data.errors
        };
      }
      
      return { 
        success: false, 
        message: error?.message || 'Email ou mot de passe incorrect' 
      };
    }
  },

  register: async (data: any): Promise<AuthResponse> => {
    try {
      console.log('📤 authService.register - Envoi:', data);
      
      const response = await authAPI.register(data);
      
      console.log('📥 authService.register - Réponse brute:', response);

      // ✅ Vérifier si la réponse indique une erreur
      if (response.success === false) {
        // ✅ Si c'est une erreur de validation
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat().join(' · ');
          return { 
            success: false, 
            message: response.message || errorMessages || 'Erreur de validation',
            errors: response.errors
          };
        }
        return { 
          success: false, 
          message: response.message || 'Erreur lors de l\'inscription' 
        };
      }

      // ✅ Vérifier que le token et l'utilisateur sont présents
      if (!response.token || !response.user) {
        return { 
          success: false, 
          message: response.message || 'Inscription réussie mais réponse incomplete' 
        };
      }

      // ✅ Stocker les tokens
      const user = response.user as User;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      
      // ✅ Redirection définie par le backend ou par défaut
      const redirectPath = response.redirect || '/dashboard/utilisateur';
      
      console.log('✅ Inscription réussie, redirection vers:', redirectPath);
      
      return { 
        success: true, 
        user, 
        token: response.token,
        message: response.message || 'Inscription réussie',
        redirect: redirectPath
      };

    } catch (error: any) {
      console.error('❌ authService.register - Erreur:', error);
      
      // ✅ Gestion des erreurs 422
      if (error.status === 422) {
        let errorMessage = error.message || 'Erreur de validation';
        
        if (error.errors && typeof error.errors === 'object') {
          const fieldErrors = Object.values(error.errors).flat();
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(' · ');
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          errors: error.errors
        };
      }
      
      // ✅ Gestion des erreurs réseau
      if (error.message && (
        error.message.includes('temps') || 
        error.message.includes('timeout') ||
        error.message.includes('connexion')
      )) {
        return { 
          success: false, 
          message: 'Le serveur met trop de temps à répondre. Vérifiez votre connexion et réessayez.'
        };
      }
      
      return { 
        success: false, 
        message: error?.message || 'Erreur lors de l\'inscription' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getTestAccounts: () => {
    return [];
  },
};