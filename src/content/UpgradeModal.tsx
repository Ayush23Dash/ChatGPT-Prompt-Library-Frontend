import React, { useState } from 'react'
import { activateLicense, TIER_FEATURES } from '../lib/tier'
import { useTier } from './TierContext'

interface Props {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: Props) {
  const { refresh } = useTier()
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await activateLicense(key)
      setSuccess(true)
      refresh()
      setTimeout(onClose, 1200)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-80 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Upgrade to Basic</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Plan comparison */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Free</div>
            <div className="text-base font-bold text-gray-800 mb-2">$0</div>
            {TIER_FEATURES.free.map((f) => (
              <div key={f} className="flex items-start gap-1 mb-1">
                <span className="text-gray-300 text-xs mt-0.5">✓</span>
                <span className="text-xs text-gray-500">{f}</span>
              </div>
            ))}
          </div>

          <div className="border-2 border-green-500 rounded-lg p-3 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              POPULAR
            </div>
            <div className="text-[10px] font-semibold text-green-600 uppercase mb-1">Basic</div>
            <div className="text-base font-bold text-gray-800 mb-2">
              $5<span className="text-xs font-normal text-gray-400">/mo</span>
            </div>
            {TIER_FEATURES.basic.map((f) => (
              <div key={f} className="flex items-start gap-1 mb-1">
                <span className="text-green-500 text-xs mt-0.5">✓</span>
                <span className="text-xs text-gray-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buy button */}
        <a
          href="https://checkout.dodopayments.com/buy/pdt_0NaOQ4e3F4b4Q7Ryl2YgO?quantity=1"
          target="_blank"
          rel="noreferrer"
          className="block w-full text-center text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 font-medium mb-4 transition-colors"
        >
          Get Basic →
        </a>

        {/* License key */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">Already purchased? Enter your license key:</p>
          {success ? (
            <div className="text-center py-2 text-sm text-green-600 font-medium">✓ Activated! Welcome to Basic.</div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-2">
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-500"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !key.trim()}
                className="w-full text-xs bg-gray-800 disabled:opacity-40 hover:bg-gray-900 text-white rounded-lg py-2 font-medium transition-colors"
              >
                {loading ? 'Activating…' : 'Activate License'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
