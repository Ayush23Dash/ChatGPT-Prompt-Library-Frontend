import React, { useState } from 'react'
import type { Folder, Prompt } from '../lib/types'
import { saveFolder, deleteFolder, updateFolder } from '../lib/storage'
import { useTier } from './TierContext'

interface Props {
  folders: Folder[]
  prompts: Prompt[]
  activeFolderId: string | null
  onSelect: (id: string) => void
  onChanged: () => void
}

export default function FolderNav({ folders, prompts, activeFolderId, onSelect, onChanged }: Props) {
  const { tier } = useTier()
  const countByFolder = prompts.reduce<Record<string, number>>((acc, p) => {
    acc[p.folderId] = (acc[p.folderId] ?? 0) + 1
    return acc
  }, {})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    const folder = await saveFolder(name)
    setNewName('')
    setAdding(false)
    onChanged()
    onSelect(folder.id)
  }

  async function handleDelete(id: string) {
    await deleteFolder(id)
    setConfirmDeleteId(null)
    onChanged()
  }

  function startRename(e: React.MouseEvent, folder: Folder) {
    e.stopPropagation()
    setRenamingId(folder.id)
    setRenameValue(folder.name)
  }

  async function commitRename(id: string) {
    const name = renameValue.trim()
    if (name) await updateFolder(id, name)
    setRenamingId(null)
    onChanged()
  }

  return (
    <div className="w-24 border-r border-gray-100 bg-gray-50 flex flex-col">
      <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Folders</div>
      <div className="flex-1 overflow-y-auto">
        {folders.map((f) => (
          <div
            key={f.id}
            className={`group flex items-center justify-between px-2 py-1.5 cursor-pointer text-xs rounded mx-1 mb-0.5 ${
              f.id === activeFolderId
                ? 'bg-green-100 text-green-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => renamingId !== f.id && onSelect(f.id)}
          >
            {renamingId === f.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitRename(f.id) }
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                onBlur={() => commitRename(f.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs border border-green-400 rounded px-1 py-0.5 outline-none bg-white"
              />
            ) : (
              <>
                <span className="truncate flex-1" title={f.name}>{f.name}</span>
                {tier === 'basic' && (countByFolder[f.id] ?? 0) > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 leading-none flex-shrink-0 ${
                    f.id === activeFolderId ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {countByFolder[f.id]}
                  </span>
                )}
                {confirmDeleteId === f.id ? (
                  <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-red-500">Sure?</span>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium leading-none"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 leading-none"
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0 ml-1">
                    <button
                      onClick={(e) => startRename(e, f)}
                      className="text-gray-400 hover:text-blue-500 leading-none"
                      title="Rename folder"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(f.id) }}
                      className="text-gray-400 hover:text-red-500 leading-none"
                      title="Delete folder"
                    >
                      ×
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="px-2 pb-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 mb-1 outline-none focus:border-green-500"
            placeholder="Folder name"
          />
          <div className="flex gap-1">
            <button onClick={handleAdd} className="flex-1 text-xs bg-green-600 text-white rounded py-0.5 hover:bg-green-700">
              Add
            </button>
            <button onClick={() => setAdding(false)} className="flex-1 text-xs bg-gray-200 rounded py-0.5 hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mx-2 mb-2 text-xs text-green-600 hover:text-green-800 text-left py-1"
        >
          + New folder
        </button>
      )}
    </div>
  )
}
