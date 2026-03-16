import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getTier, type Tier } from '../lib/tier'

interface TierCtx {
  tier: Tier
  refresh: () => void
}

const TierContext = createContext<TierCtx>({ tier: 'free', refresh: () => {} })

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('free')
  const refresh = useCallback(() => { getTier().then(setTier) }, [])
  useEffect(() => { refresh() }, [])
  return <TierContext.Provider value={{ tier, refresh }}>{children}</TierContext.Provider>
}

export function useTier() {
  return useContext(TierContext)
}
