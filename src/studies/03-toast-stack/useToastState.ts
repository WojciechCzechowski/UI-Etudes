import { useSyncExternalStore } from 'react'
import type { ToastState, ToastStore } from './toastStore'

export function useToastState(store: ToastStore): ToastState {
  return useSyncExternalStore(store.subscribe, store.getState)
}
