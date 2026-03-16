import React, { useState } from 'react'
import type { Folder, Prompt } from '../lib/types'
import PromptCard from './PromptCard'

interface Props {
  prompts: Prompt[]
  folders: Folder[]
  onChanged: () => void
}

export default function PromptList({ prompts, folders, onChanged }: Props) {
  const [search, setSearch] = useState('')

  const filtered = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-2 pt-2 pb-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts…"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-green-400 bg-gray-50"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-6">
            {prompts.length === 0 ? 'No prompts yet.\nClick + Save to add one.' : 'No results.'}
          </p>
        ) : (
          filtered.map((p) => <PromptCard key={p.id} prompt={p} folders={folders} onChanged={onChanged} />)
        )}
      </div>
    </div>
  )
}
