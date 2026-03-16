import React, { useState, useEffect } from 'react'
import type { Folder } from '../lib/types'
import { savePrompt, saveFolder } from '../lib/storage'

interface Props {
  folders: Folder[]
  activeFolderId: string | null
  onSaved: () => void
  onCancel: () => void
  onCapReached?: () => void
}

export default function SavePromptForm({ folders, activeFolderId, onSaved, onCancel, onCapReached }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [folderId, setFolderId] = useState(activeFolderId ?? '')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders)

  useEffect(() => { setLocalFolders(folders) }, [folders])

  useEffect(() => {
    // ChatGPT uses a contenteditable div (#prompt-textarea), not a real <textarea>
    const el =
      document.querySelector('#prompt-textarea') ??
      document.querySelector('[contenteditable="true"]') ??
      document.querySelector('textarea')
    if (!el) return
    const text = (el as HTMLTextAreaElement).value ?? el.textContent ?? ''
    if (text.trim()) setBody(text.trim())
  }, [])

  useEffect(() => {
    if (activeFolderId) setFolderId(activeFolderId)
  }, [activeFolderId])

  async function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    const folder = await saveFolder(name)
    setLocalFolders((prev) => [...prev, folder])
    setFolderId(folder.id)
    setNewFolderName('')
    setCreatingFolder(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim() || !folderId) return
    try {
      await savePrompt({ title: title.trim(), body: body.trim(), folderId })
      onSaved()
    } catch (err) {
      if ((err as Error).message === 'PROMPT_CAP_REACHED') onCapReached?.()
    }
  }

  return (
    <div className="border-b border-gray-100 p-3 bg-green-50">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prompt title"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500 bg-white"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Prompt body — use {variable} for substitution"
          rows={4}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500 bg-white resize-none"
        />
        <div className="flex gap-1">
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500 bg-white"
          >
            <option value="">Select folder…</option>
            {localFolders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreatingFolder((v) => !v)}
            className="text-xs px-2 py-1.5 bg-white border border-gray-200 rounded hover:border-green-400 hover:text-green-600 text-gray-500 whitespace-nowrap"
            title="New folder"
          >
            + Folder
          </button>
        </div>

        {creatingFolder && (
          <div className="flex gap-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateFolder() } if (e.key === 'Escape') setCreatingFolder(false) }}
              placeholder="Folder name"
              className="flex-1 text-xs border border-green-400 rounded px-2 py-1.5 outline-none bg-white"
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              className="text-xs px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setCreatingFolder(false)}
              className="text-xs px-2 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!title.trim() || !body.trim() || !folderId}
            className="flex-1 text-xs bg-green-600 disabled:opacity-40 hover:bg-green-700 text-white rounded py-1.5 font-medium"
          >
            Save prompt
          </button>
          <button type="button" onClick={onCancel} className="flex-1 text-xs bg-gray-200 rounded py-1.5 hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
