import { useState, useEffect } from 'react';
import { UserProfile, getUserData, updateUserData, updateProfileImage } from '@/lib/userData';

export const useUserData = (userId: string = "1") => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserData(userId);
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // Fonction pour mettre à jour les données utilisateur
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!userData) return;

    try {
      setLoading(true);
      const updatedData = await updateUserData(userData.id, updates);
      setUserData(updatedData);
      return updatedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour l'image de profil
  const updateProfileImageUrl = async (imageUrl: string) => {
    if (!userData) return;

    try {
      setLoading(true);
      await updateProfileImage(userData.id, imageUrl);
      setUserData(prev => prev ? { ...prev, profileImage: imageUrl } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour les statistiques
  const updateStats = async (statsUpdates: Partial<UserProfile['stats']>) => {
    if (!userData) return;

    try {
      setLoading(true);
      const updatedData = await updateUserData(userData.id, {
        stats: { ...userData.stats, ...statsUpdates }
      });
      setUserData(updatedData);
      return updatedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des statistiques');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour recharger les données
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserData(userId);
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rechargement');
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    loading,
    error,
    updateUser,
    updateUserData: updateUser, // Alias pour compatibilité
    updateProfileImageUrl,
    updateStats,
    refreshData
  };
};
