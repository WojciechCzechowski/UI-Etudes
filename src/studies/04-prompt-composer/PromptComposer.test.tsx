import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { PromptComposer } from './PromptComposer'

const refs = () => within(screen.getByRole('list', { name: 'References' }))

test('starts on Image with its slot, suggestions and credits', () => {
  render(<PromptComposer />)
  expect(screen.getByRole('tab', { name: 'Image' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(refs().getAllByRole('button')).toHaveLength(1)
  expect(screen.getByRole('list', { name: 'Suggestions' })).toBeVisible()
  expect(screen.getByText('52 left')).toBeVisible()
})

test('Video shows five slots and Lip sync shows two without suggestions', async () => {
  const user = userEvent.setup()
  render(<PromptComposer />)
  await user.click(screen.getByRole('tab', { name: 'Video' }))
  expect(refs().getAllByRole('button')).toHaveLength(5)
  expect(screen.getByRole('textbox')).toHaveAttribute(
    'placeholder',
    'Describe your video or reference by using @...',
  )
  await user.click(screen.getByRole('tab', { name: 'Lip sync' }))
  expect(refs().getAllByRole('button')).toHaveLength(2)
  expect(screen.queryByRole('list', { name: 'Suggestions' })).toBeNull()
  expect(screen.queryByRole('textbox')).toBeNull()
})

test('the prompt survives a visit to Lip sync', async () => {
  const user = userEvent.setup()
  render(<PromptComposer />)
  await user.type(screen.getByRole('textbox'), 'A red fox')
  await user.click(screen.getByRole('tab', { name: 'Lip sync' }))
  await user.click(screen.getByRole('tab', { name: 'Image' }))
  expect(screen.getByRole('textbox')).toHaveValue('A red fox')
})

test('arrow keys move between tabs', async () => {
  const user = userEvent.setup()
  render(<PromptComposer />)
  screen.getByRole('tab', { name: 'Image' }).focus()
  await user.keyboard('{ArrowRight}')
  expect(screen.getByRole('tab', { name: 'Video' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
