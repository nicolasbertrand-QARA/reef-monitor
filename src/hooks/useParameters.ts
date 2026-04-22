import { useState, useEffect, useCallback } from 'react';
import { Reading, Thresholds, ParameterKey } from '@/src/models/types';
import { getLatestReadings, getReadingHistory, getThresholds } from '@/src/db/queries';

export function useLatestReadings(tankId: number) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [r, t] = await Promise.all([getLatestReadings(tankId), getThresholds(tankId)]);
    setReadings(r);
    setThresholds(t);
    setLoading(false);
  }, [tankId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { readings, thresholds, loading, refresh };
}

export function useReadingHistory(parameter: ParameterKey, tankId: number, days?: number) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await getReadingHistory(parameter, tankId, days);
    setReadings(r);
    setLoading(false);
  }, [parameter, tankId, days]);

  useEffect(() => { refresh(); }, [refresh]);

  return { readings, loading, refresh };
}
