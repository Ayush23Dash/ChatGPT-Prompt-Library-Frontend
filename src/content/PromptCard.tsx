import React, { useState } from 'react'
import type { Folder, Prompt } from '../lib/types'
import { deletePrompt, updatePrompt } from '../lib/storage'
import VariableModal from './VariableModal'
import { useTier } from './TierContext'

interface Props {
  prompt: Prompt
  folders: Folder[]
  onChanged: () => void
}

export default function PromptCard({ prompt, folders, onChanged }: Props) {
  const { tier } = useTier()
  const isBasic = tier === 'basic'
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(prompt.title)
  const [editBody, setEditBody] = useState(prompt.body)
  const [editFolderId, setEditFolderId] = useState(prompt.folderId)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [insertError, setInsertError] = useState(false)

  function getTextarea(): HTMLTextAreaElement | null {
    return (
      (document.querySelector('#prompt-textarea') as HTMLTextAreaElement) ??
      (document.querySelector('textarea[data-id]') as HTMLTextAreaElement) ??
      (document.querySelector('textarea') as HTMLTextAreaElement)
    )
  }

  function insertText(text: string) {
    const ta = getTextarea()
    if (!ta) {
      setInsertError(true)
      setTimeout(() => setInsertError(false), 2000)
      return
    }

    if (ta.tagName !== 'TEXTAREA') {
      const el = ta as unknown as HTMLElement
      el.focus()
      el.textContent = text
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
    nativeInputValueSetter?.call(ta, text)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.dispatchEvent(new Event('change', { bubbles: true }))
    ta.focus()
  }

  function handleInsert() {
    const vars = [...prompt.body.matchAll(/\{(\w+)\}/g)].map((m) => m[1])
    const unique = [...new Set(vars)]
    if (unique.length === 0) {
      insertText(prompt.body)
    } else {
      setShowModal(true)
    }
  }

  async function handleDelete() {
    await deletePrompt(prompt.id)
    onChanged()
  }

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setEditTitle(prompt.title)
    setEditBody(prompt.body)
    setEditFolderId(prompt.folderId)
    setExpanded(false)
    setEditing(true)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTitle.trim() || !editBody.trim()) return
    await updatePrompt(prompt.id, { title: editTitle.trim(), body: editBody.trim(), folderId: editFolderId })
    setEditing(false)
    onChanged()
  }

  // --- Edit mode ---
  if (editing) {
    return (
      <div className="border border-green-300 rounded-lg mb-2 bg-white shadow-sm overflow-hidden">
        <form onSubmit={handleSaveEdit} className="p-2.5 space-y-2">
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500"
            placeholder="Title"
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={5}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500 resize-none"
            placeholder="Prompt body"
          />
          <select
            value={editFolderId}
            onChange={(e) => setEditFolderId(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-500 bg-white"
          >
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!editTitle.trim() || !editBody.trim()}
              className="flex-1 text-xs bg-green-600 disabled:opacity-40 hover:bg-green-700 text-white rounded py-1.5 font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  // --- Normal / expanded view ---
  return (
    <>
      <div className="group border border-gray-100 rounded-lg mb-2 bg-white hover:border-green-300 hover:shadow-sm transition-all overflow-hidden">
        {/* Clickable header — expand only for basic */}
        <div className={`p-2.5 ${isBasic ? 'cursor-pointer' : ''}`} onClick={() => isBasic && setExpanded((v) => !v)}>
          <div className="flex items-start justify-between gap-1">
            <span className="text-xs font-medium text-gray-800 truncate flex-1">{prompt.title}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isBasic && !confirmingDelete && (
                <button
                  onClick={startEdit}
                  className="hidden group-hover:block text-gray-300 hover:text-blue-500 text-xs leading-none"
                  title="Edit"
                >
                  ✎
                </button>
              )}
              {confirmingDelete ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-red-500">Sure?</span>
                  <button
                    onClick={() => handleDelete()}
                    className="text-xs text-red-500 hover:text-red-700 font-medium leading-none"
                    title="Confirm delete"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 leading-none"
                    title="Cancel"
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true) }}
                  className="hidden group-hover:block text-gray-300 hover:text-red-500 text-sm leading-none"
                  title="Delete"
                >
                  ×
                </button>
              )}
              {isBasic && (
                <span className="text-gray-300 text-xs">{expanded ? '▲' : '▼'}</span>
              )}
            </div>
          </div>
          {!expanded && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{prompt.body}</p>
          )}
        </div>

        {/* Expanded full body */}
        {expanded && (
          <div className="px-2.5 pb-2 cursor-pointer" onClick={() => setExpanded(false)}>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100 max-h-48 overflow-y-auto">
              {prompt.body}
            </p>
          </div>
        )}

        <div className="px-2.5 pb-2.5">
          <button
            onClick={handleInsert}
            className={`w-full text-xs text-white rounded py-1 transition-colors ${
              insertError ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {insertError ? 'Textarea not found' : 'Insert'}
          </button>
        </div>
      </div>

      {showModal && (
        <VariableModal
          body={prompt.body}
          onInsert={insertText}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
