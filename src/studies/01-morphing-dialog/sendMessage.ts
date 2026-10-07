export type SendMessage = (
  message: string,
  options: { signal: AbortSignal },
) => Promise<void>

type FakeSendMessageOptions = {
  pendingMs: number
  /** Makes the send fail. */
  fail: boolean
}

/** Stands in for a server call: waits, then succeeds or fails. */
export function fakeSendMessage({
  pendingMs,
  fail,
}: FakeSendMessageOptions): SendMessage {
  return (_message, { signal }) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (fail) reject(new Error('Network error'))
        else resolve()
      }, pendingMs)

      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(signal.reason)
      })
    })
}
