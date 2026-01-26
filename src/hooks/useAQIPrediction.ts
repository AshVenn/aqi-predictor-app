import { useState, useCallback } from 'react';
import { predictAQI, type PredictPayload } from '@/lib/apiClient';
import type { AQIResult } from '@/types/aqi';

interface UseAQIPredictionReturn {
  result: AQIResult | null;
  isLoading: boolean;
  error: string | null;
  predict: (payload: PredictPayload) => Promise<void>;
  reset: () => void;
}

export function useAQIPrediction(): UseAQIPredictionReturn {
  const [result, setResult] = useState<AQIResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (payload: PredictPayload) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (
        !Number.isFinite(payload.latitude) ||
        payload.latitude < -90 ||
        payload.latitude > 90
      ) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (
        !Number.isFinite(payload.longitude) ||
        payload.longitude < -180 ||
        payload.longitude > 180
      ) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (!payload.timestamp || !payload.timestamp.includes('T')) {
        throw new Error('Timestamp must be a valid ISO 8601 string');
      }

      const response = await predictAQI(payload);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, predict, reset };
}
