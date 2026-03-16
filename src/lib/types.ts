export interface Folder {
  id: string
  name: string
  createdAt: number
}

export interface Prompt {
  id: string
  folderId: string
  title: string
  body: string
  createdAt: number
}
