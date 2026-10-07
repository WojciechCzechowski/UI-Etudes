export type Folder = { name: string; items: number }

export const initialFolders: Folder[] = [
  { name: 'Contracts', items: 14 },
  { name: 'Invoices', items: 86 },
  { name: 'Photos', items: 212 },
  { name: 'Receipts', items: 47 },
  { name: 'Tax 2025', items: 9 },
]

export type CreateFolder = (
  name: string,
  options: { signal: AbortSignal },
) => Promise<void>

export class DuplicateFolderError extends Error {
  folderName: string

  constructor(folderName: string) {
    super(`A folder named "${folderName}" already exists.`)
    this.name = 'DuplicateFolderError'
    this.folderName = folderName
  }
}

type FakeCreateFolderOptions = {
  existing: Folder[]
  pendingMs: number
  /** Fails with a duplicate name error whatever the name is. */
  forceError: boolean
}

/** Stands in for a server call: waits, then checks the name against the list. */
export function fakeCreateFolder({
  existing,
  pendingMs,
  forceError,
}: FakeCreateFolderOptions): CreateFolder {
  return (name, { signal }) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const taken = existing.some(
          (folder) => folder.name.toLowerCase() === name.toLowerCase(),
        )
        if (taken || forceError) reject(new DuplicateFolderError(name))
        else resolve()
      }, pendingMs)

      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(signal.reason)
      })
    })
}
