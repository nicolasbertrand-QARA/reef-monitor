import { useState, useEffect, useCallback } from 'react';
import { ParameterKey } from '@/src/models/types';
import { getUnitPreferences, setUnitPreference } from '@/src/db/queries';

export function useUnitPrefs() {
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const p = await getUnitPreferences();
    setPrefs(p);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setPref = useCallback(async (parameter: ParameterKey, unit: string) => {
    await setUnitPreference(parameter, unit);
    setPrefs((prev) => ({ ...prev, [parameter]: unit }));
  }, []);

  return { prefs, loading, refresh, setPref };
}
