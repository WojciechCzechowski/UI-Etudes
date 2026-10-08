import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
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
