import { useState, useEffect } from 'react';

interface Promotion {
  id: string; // UUID
  name: string;
  created_at: string;
  is_active?: boolean;
  student_count?: number;
}

interface UsePromotionsDataReturn {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const usePromotionsData = (): UsePromotionsDataReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3004/promotions`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPromotions(result.data);
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des promotions');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des promotions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const refetch = () => {
    fetchPromotions();
  };

  return {
    promotions,
    loading,
    error,
    refetch,
  };
};

export default usePromotionsData;
