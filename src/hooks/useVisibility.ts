import { useState, useEffect, useCallback } from 'react';
import { ParameterKey } from '@/src/models/types';
import { getVisibleParams } from '@/src/db/queries';

export function useVisibleParams(tankId: number) {
  const [visible, setVisible] = useState<Set<ParameterKey>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const v = await getVisibleParams(tankId);
    setVisible(v);
    setLoading(false);
  }, [tankId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { visible, loading, refresh };
}
