import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { ThemeSwitch } from './ThemeSwitch'

afterEach(() => {
  delete document.documentElement.dataset.theme
})

it('cycles system, light, dark and sets data-theme on the root', async () => {
  const user = userEvent.setup()
  render(<ThemeSwitch />)
  const root = document.documentElement

  const system = screen.getByRole('button', {
    name: 'Theme: system. Switch to light.',
  })
  expect(root).not.toHaveAttribute('data-theme')

  await user.click(system)
  expect(root).toHaveAttribute('data-theme', 'light')

  await user.click(
    screen.getByRole('button', { name: 'Theme: light. Switch to dark.' }),
  )
  expect(root).toHaveAttribute('data-theme', 'dark')

  await user.click(
    screen.getByRole('button', { name: 'Theme: dark. Switch to system.' }),
  )
  expect(root).not.toHaveAttribute('data-theme')
})
