import React, { useState } from 'react'

interface Props {
  body: string
  onInsert: (text: string) => void
  onClose: () => void
}

export default function VariableModal({ body, onInsert, onClose }: Props) {
  const vars = [...new Set([...body.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))]
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(vars.map((v) => [v, '']))
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let result = body
    for (const [key, val] of Object.entries(values)) {
      result = result.replaceAll(`{${key}}`, val)
    }
    onInsert(result)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Fill in variables</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {vars.map((v) => (
            <div key={v}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {'{'}
                {v}
                {'}'}
              </label>
              <input
                autoFocus={vars[0] === v}
                value={values[v]}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-500"
                placeholder={`Enter ${v}`}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg py-1.5 font-medium transition-colors"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg py-1.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
