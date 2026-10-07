import { Dialog } from 'radix-ui'

export function NewFolderForm() {
  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="folder-name" className="text-sm font-medium">
          Folder name
        </label>
        <input
          id="folder-name"
          name="name"
          autoComplete="off"
          placeholder="Tax 2026"
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Dialog.Close className="rounded-[var(--radius-sm)] px-4 py-2 font-medium hover:bg-[var(--color-border)]">
          Cancel
        </Dialog.Close>
        <button
          type="submit"
          className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-accent-text)]"
        >
          Create
        </button>
      </div>
    </form>
  )
}
