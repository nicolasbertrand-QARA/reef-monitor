import { useState, useEffect, useCallback } from 'react';
import { ParameterKey } from '@/src/models/types';
import { getVisibleParams } from '@/src/db/queries';

export function useVisibleParams() {
  const [visible, setVisible] = useState<Set<ParameterKey>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const v = await getVisibleParams();
    setVisible(v);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { visible, loading, refresh };
}
