import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Tank } from '@/src/models/types';
import { getTanks, getActiveTankId, setActiveTankId } from '@/src/db/queries';

interface TankContextValue {
  tanks: Tank[];
  activeTank: Tank | null;
  switchTank: (id: number) => Promise<void>;
  refreshTanks: () => Promise<void>;
}

export const TankContext = createContext<TankContextValue>({
  tanks: [],
  activeTank: null,
  switchTank: async () => {},
  refreshTanks: async () => {},
});

export function useTank() {
  return useContext(TankContext);
}

export function useTankProvider() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [activeTankId, setActiveId] = useState<number | null>(null);

  const refreshTanks = useCallback(async () => {
    const [allTanks, activeId] = await Promise.all([getTanks(), getActiveTankId()]);
    setTanks(allTanks);
    setActiveId(activeId);
  }, []);

  const switchTank = useCallback(async (id: number) => {
    await setActiveTankId(id);
    setActiveId(id);
  }, []);

  useEffect(() => { refreshTanks(); }, [refreshTanks]);

  const activeTank = tanks.find((t) => t.id === activeTankId) ?? tanks[0] ?? null;

  return { tanks, activeTank, switchTank, refreshTanks };
}
