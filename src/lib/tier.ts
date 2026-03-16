export type Tier = 'free' | 'basic'

export const PROMPT_CAPS: Record<Tier, number> = {
  free: 15,
  basic: 100,
}

export const TIER_FEATURES: Record<Tier, string[]> = {
  free: [
    'Up to 15 prompts',
    'Folders & organization',
    'Variable substitution {var}',
    'Search within folder',
  ],
  basic: [
    'Up to 100 prompts',
    'Export & Import JSON backup',
    'Edit prompts',
    'Prompt count badges',
    'Full prompt preview',
  ],
}

const VALIDATE_URL = 'https://chatgpt-prompt-library-backend.vercel.app/api/validate'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

async function getOrCreateInstanceId(): Promise<string> {
  const result = await chrome.storage.sync.get('instanceId')
  if (result.instanceId) return result.instanceId as string
  const id = crypto.randomUUID()
  await chrome.storage.sync.set({ instanceId: id })
  return id
}

export async function getTier(): Promise<Tier> {
  const result = await chrome.storage.sync.get([
    'tier', 'licenseKey', 'instanceId', 'lastValidated',
  ])

  if (result.tier !== 'basic') return 'free'

  // Revalidate once per day in the background (no UI block)
  const lastValidated = result.lastValidated as number | undefined
  if (!lastValidated || lastValidated < Date.now() - ONE_DAY_MS) {
    revalidate(result.licenseKey as string, result.instanceId as string).catch(() => {})
  }

  return 'basic'
}

export async function activateLicense(key: string): Promise<void> {
  const trimmed = key.trim()
  if (!trimmed) throw new Error('Enter a license key')

  const instanceId = await getOrCreateInstanceId()

  let res: Response
  try {
    res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: trimmed, instanceId }),
    })
  } catch {
    throw new Error('Network error — check your connection')
  }

  const data = await res.json()

  if (!data.valid) {
    throw new Error(data.error ?? 'Invalid license key')
  }

  await chrome.storage.sync.set({
    tier: 'basic',
    licenseKey: trimmed,
    instanceId,
    lastValidated: Date.now(),
  })
}

async function revalidate(licenseKey: string, instanceId: string): Promise<void> {
  try {
    const res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, instanceId }),
    })
    const data = await res.json()

    if (!data.valid) {
      // Subscription cancelled/expired — downgrade
      await chrome.storage.sync.remove(['tier', 'licenseKey', 'lastValidated'])
    } else {
      await chrome.storage.sync.set({ lastValidated: Date.now() })
    }
  } catch {
    // Network error — keep current tier (offline grace period)
  }
}

export async function getLicenseKey(): Promise<string | null> {
  const result = await chrome.storage.sync.get('licenseKey')
  return (result.licenseKey as string) ?? null
}
