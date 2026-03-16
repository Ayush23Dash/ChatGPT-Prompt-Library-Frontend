import type { Folder, Prompt } from './types'
import { getTier, PROMPT_CAPS } from './tier'

const FOLDER_PREFIX = 'folder_'
const PROMPT_PREFIX = 'prompt_'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// --- Folders ---

export async function getFolders(): Promise<Folder[]> {
  const all = await chrome.storage.sync.get(null)
  return Object.entries(all)
    .filter(([key]) => key.startsWith(FOLDER_PREFIX))
    .map(([, val]) => val as Folder)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function saveFolder(name: string): Promise<Folder> {
  const folder: Folder = { id: generateId(), name, createdAt: Date.now() }
  await chrome.storage.sync.set({ [`${FOLDER_PREFIX}${folder.id}`]: folder })
  return folder
}

export async function updateFolder(id: string, name: string): Promise<void> {
  const result = await chrome.storage.sync.get(`${FOLDER_PREFIX}${id}`)
  const existing = result[`${FOLDER_PREFIX}${id}`] as Folder
  if (!existing) return
  await chrome.storage.sync.set({ [`${FOLDER_PREFIX}${id}`]: { ...existing, name } })
}

export async function deleteFolder(id: string): Promise<void> {
  const prompts = await getPrompts()
  const promptKeysToRemove = prompts
    .filter((p) => p.folderId === id)
    .map((p) => `${PROMPT_PREFIX}${p.id}`)
  await chrome.storage.sync.remove([`${FOLDER_PREFIX}${id}`, ...promptKeysToRemove])
}

// --- Prompts ---

export async function getPrompts(): Promise<Prompt[]> {
  const all = await chrome.storage.sync.get(null)
  return Object.entries(all)
    .filter(([key]) => key.startsWith(PROMPT_PREFIX))
    .map(([, val]) => val as Prompt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function savePrompt(data: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> {
  const [prompts, tier] = await Promise.all([getPrompts(), getTier()])
  if (prompts.length >= PROMPT_CAPS[tier]) throw new Error('PROMPT_CAP_REACHED')
  const prompt: Prompt = { ...data, id: generateId(), createdAt: Date.now() }
  await chrome.storage.sync.set({ [`${PROMPT_PREFIX}${prompt.id}`]: prompt })
  return prompt
}

export async function deletePrompt(id: string): Promise<void> {
  await chrome.storage.sync.remove(`${PROMPT_PREFIX}${id}`)
}

export async function updatePrompt(id: string, changes: Partial<Pick<Prompt, 'title' | 'body' | 'folderId'>>): Promise<void> {
  const result = await chrome.storage.sync.get(`${PROMPT_PREFIX}${id}`)
  const existing = result[`${PROMPT_PREFIX}${id}`] as Prompt
  if (!existing) return
  await chrome.storage.sync.set({ [`${PROMPT_PREFIX}${id}`]: { ...existing, ...changes } })
}

// --- Export / Import ---

export async function exportData(): Promise<void> {
  const [folders, prompts] = await Promise.all([getFolders(), getPrompts()])
  const json = JSON.stringify({ folders, prompts }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(json: string): Promise<{ folders: number; prompts: number }> {
  const data = JSON.parse(json)
  if (!Array.isArray(data.folders) || !Array.isArray(data.prompts)) {
    throw new Error('Invalid file format')
  }

  const [existingFolders, existingPrompts] = await Promise.all([getFolders(), getPrompts()])
  const existingFolderIds = new Set(existingFolders.map((f) => f.id))
  const existingPromptIds = new Set(existingPrompts.map((p) => p.id))

  const newFolders = (data.folders as Folder[]).filter((f) => !existingFolderIds.has(f.id))
  const newPrompts = (data.prompts as Prompt[]).filter((p) => !existingPromptIds.has(p.id))

  const toSet: Record<string, Folder | Prompt> = {}
  for (const f of newFolders) toSet[`${FOLDER_PREFIX}${f.id}`] = f
  for (const p of newPrompts) toSet[`${PROMPT_PREFIX}${p.id}`] = p

  if (Object.keys(toSet).length > 0) await chrome.storage.sync.set(toSet)

  return { folders: newFolders.length, prompts: newPrompts.length }
}
