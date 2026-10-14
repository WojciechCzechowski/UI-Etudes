import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { THEME_KEY } from '../shared/theme'
import { studies } from '../studies/registry'
import { Hub } from './Hub'

test('shows the title, the subtitle and the introduction', () => {
  render(<Hub />)
  expect(
    screen.getByRole('heading', { level: 1, name: 'UI Études' }),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Small, finished interaction studies in React.'),
  ).toBeInTheDocument()
  expect(screen.getByText(/French for/)).toBeInTheDocument()
})

test('lists every study as one link with its summary as the description', () => {
  render(<Hub />)
  const links = screen.getAllByRole('link')
  expect(links).toHaveLength(studies.length)
  for (const study of studies) {
    const link = screen.getByRole('link', { name: study.title })
    expect(link).toHaveAttribute('href', `./${study.slug}/`)
    expect(link).toHaveAccessibleDescription(study.summary)
  }
})

describe('theme switch', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  test('stores the choice and applies it to the root', async () => {
    const user = userEvent.setup()
    render(<Hub />)
    const group = screen.getByRole('radiogroup', { name: 'Theme' })
    expect(within(group).getByRole('radio', { name: 'System' })).toBeChecked()

    await user.click(within(group).getByRole('radio', { name: 'Dark' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')

    await user.click(within(group).getByRole('radio', { name: 'System' }))
    expect(document.documentElement).not.toHaveAttribute('data-theme')
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
  })

  test('starts from the stored choice', () => {
    localStorage.setItem(THEME_KEY, 'light')
    render(<Hub />)
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})
