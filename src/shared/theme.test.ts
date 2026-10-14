import { afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_KEY, readStoredTheme, storeTheme } from './theme'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('stored theme', () => {
  it('round trips light and dark, and clears the key for system', () => {
    storeTheme('dark')
    expect(readStoredTheme()).toBe('dark')
    storeTheme('system')
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
    expect(readStoredTheme()).toBe('system')
  })

  it('ignores an invalid value', () => {
    localStorage.setItem(THEME_KEY, 'purple')
    expect(readStoredTheme()).toBe('system')
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredTheme()).toBe('system')
    expect(() => storeTheme('dark')).not.toThrow()
  })
})
