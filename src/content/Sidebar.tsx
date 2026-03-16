import React, { useState, useEffect, useRef } from 'react'
import FolderNav from './FolderNav'
import PromptList from './PromptList'
import SavePromptForm from './SavePromptForm'
import UpgradeModal from './UpgradeModal'
import { useTier } from './TierContext'
import type { Folder, Prompt } from '../lib/types'
import { getFolders, getPrompts, exportData, importData } from '../lib/storage'
import { PROMPT_CAPS } from '../lib/tier'

export default function Sidebar() {
  const { tier } = useTier()
  const [open, setOpen] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function reload() {
    const [f, p] = await Promise.all([getFolders(), getPrompts()])
    setFolders(f)
    setPrompts(p)
    if (!activeFolderId && f.length > 0) setActiveFolderId(f[0].id)
  }

  useEffect(() => { reload() }, [])

  function handleSaveClick() {
    if (prompts.length >= PROMPT_CAPS[tier]) {
      setShowUpgradeModal(true)
    } else {
      setShowSaveForm((v) => !v)
    }
  }

  async function handleExport() {
    await exportData()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const { folders: f, prompts: p } = await importData(text)
      await reload()
      setImportStatus(`Imported ${f} folder${f !== 1 ? 's' : ''}, ${p} prompt${p !== 1 ? 's' : ''}`)
    } catch {
      setImportStatus('Import failed — invalid file')
    } finally {
      e.target.value = ''
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  const cap = PROMPT_CAPS[tier]
  const used = prompts.length
  const atCap = used >= cap

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[10000] bg-green-600 hover:bg-green-700 text-white rounded-l-lg px-1.5 py-3 shadow-lg transition-colors"
        title="Prompt Library"
      >
        <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: 12, letterSpacing: 1 }}>
          Prompts
        </span>
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-[9999] flex flex-col transition-transform duration-300 border-l border-gray-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Prompt Library</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              tier === 'basic' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/30 text-white'
            }`}>
              {tier.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              className={`text-xs px-2 py-1 rounded font-medium ${
                atCap
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
              title={atCap ? `Prompt cap reached (${cap})` : 'Save current textarea as prompt'}
            >
              {atCap ? '⚠ Cap reached' : '+ Save'}
            </button>
            <button onClick={() => setOpen(false)} className="text-white hover:text-green-200 text-lg leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Prompt usage bar (free only) */}
        {tier === 'free' && (
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{used} / {cap} prompts used</span>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Upgrade →
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${atCap ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((used / cap) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Export / Import toolbar (basic only) */}
        {tier === 'basic' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleExport}
              className="flex-1 text-xs text-gray-600 hover:text-green-700 hover:bg-green-50 border border-gray-200 rounded px-2 py-1 transition-colors"
            >
              ↓ Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-xs text-gray-600 hover:text-green-700 hover:bg-green-50 border border-gray-200 rounded px-2 py-1 transition-colors"
            >
              ↑ Import
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        )}

        {importStatus && (
          <div className={`text-xs px-3 py-1.5 text-center ${importStatus.includes('failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {importStatus}
          </div>
        )}

        {showSaveForm && (
          <SavePromptForm
            folders={folders}
            activeFolderId={activeFolderId}
            onSaved={() => { setShowSaveForm(false); reload() }}
            onCancel={() => setShowSaveForm(false)}
            onCapReached={() => { setShowSaveForm(false); setShowUpgradeModal(true) }}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          <FolderNav
            folders={folders}
            prompts={prompts}
            activeFolderId={activeFolderId}
            onSelect={setActiveFolderId}
            onChanged={reload}
          />
          <PromptList
            prompts={prompts.filter((p) => p.folderId === activeFolderId)}
            folders={folders}
            onChanged={reload}
          />
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => { setShowUpgradeModal(false); reload() }} />
      )}
    </>
  )
}
