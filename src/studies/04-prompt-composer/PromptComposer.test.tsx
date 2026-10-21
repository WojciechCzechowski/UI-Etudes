import {
  render as rtlRender,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { PromptComposer } from './PromptComposer'

// Reduced motion keeps the tests free of the pill's spring.
const render = (suggestionsDelayMs = 0) =>
  rtlRender(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <PromptComposer suggestionsDelayMs={suggestionsDelayMs} />
    </DemoSettingsProvider>,
  )

const refs = () => within(screen.getByRole('list', { name: 'References' }))

test('starts on Image with its slot and credits, suggestions closed', () => {
  render()
  expect(screen.getByRole('tab', { name: 'Image' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(refs().getAllByRole('button')).toHaveLength(1)
  expect(screen.queryByRole('list', { name: 'Suggestions' })).toBeNull()
  expect(screen.getByText('52 left')).toBeVisible()
})

test('the credits pill is hidden from assistive tech outside Image', async () => {
  const user = userEvent.setup()
  render()
  const pill = screen.getByText('52 left').parentElement
  expect(pill).not.toHaveAttribute('aria-hidden')
  await user.click(screen.getByRole('tab', { name: 'Video' }))
  expect(pill).toHaveAttribute('aria-hidden', 'true')
  await user.click(screen.getByRole('tab', { name: 'Image' }))
  expect(pill).not.toHaveAttribute('aria-hidden')
})

test('Video shows five slots and Lip sync shows two without suggestions', async () => {
  const user = userEvent.setup()
  render()
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
  render()
  await user.type(screen.getByRole('textbox'), 'A red fox')
  await user.click(screen.getByRole('tab', { name: 'Lip sync' }))
  await user.click(screen.getByRole('tab', { name: 'Image' }))
  expect(screen.getByRole('textbox')).toHaveValue('A red fox')
})

test('arrow keys move between tabs', async () => {
  const user = userEvent.setup()
  render()
  screen.getByRole('tab', { name: 'Image' }).focus()
  await user.keyboard('{ArrowRight}')
  expect(screen.getByRole('tab', { name: 'Video' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('the pill sits in the selected tab only', async () => {
  const user = userEvent.setup()
  render()
  const pillIn = (name: string) =>
    screen.getByRole('tab', { name }).querySelector('[aria-hidden="true"]')
  expect(pillIn('Image')).not.toBeNull()
  expect(pillIn('Video')).toBeNull()
  await user.click(screen.getByRole('tab', { name: 'Video' }))
  expect(pillIn('Video')).not.toBeNull()
})

test('the suggestions button opens and closes the bar', async () => {
  const user = userEvent.setup()
  render()
  await user.click(screen.getByRole('button', { name: 'Show suggestions' }))
  expect(screen.getByRole('list', { name: 'Suggestions' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Hide suggestions' }))
  await waitFor(() =>
    expect(screen.queryByRole('list', { name: 'Suggestions' })).toBeNull(),
  )
})

test('the bar closes on Lip sync and the button is disabled there', async () => {
  const user = userEvent.setup()
  render()
  await user.click(screen.getByRole('button', { name: 'Show suggestions' }))
  await user.click(screen.getByRole('tab', { name: 'Lip sync' }))
  await waitFor(() =>
    expect(screen.queryByRole('list', { name: 'Suggestions' })).toBeNull(),
  )
  expect(screen.getByRole('button', { name: /suggestions/ })).toBeDisabled()
})

test('the suggestions load first, then the chips replace the loading state', async () => {
  const user = userEvent.setup()
  render(200)
  await user.click(screen.getByRole('button', { name: 'Show suggestions' }))
  const bar = screen.getByRole('list', { name: 'Suggestions' })
  expect(bar).toHaveAttribute('aria-busy', 'true')
  expect(within(bar).queryByRole('button')).toBeNull()
  await waitFor(() =>
    expect(
      within(screen.getByRole('list', { name: 'Suggestions' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(3),
  )
  expect(screen.getByRole('list', { name: 'Suggestions' })).toHaveAttribute(
    'aria-busy',
    'false',
  )
})

test('reopening the bar loads the suggestions again', async () => {
  const user = userEvent.setup()
  render(100)
  await user.click(screen.getByRole('button', { name: 'Show suggestions' }))
  await waitFor(() =>
    expect(screen.getByRole('list', { name: 'Suggestions' })).toHaveAttribute(
      'aria-busy',
      'false',
    ),
  )
  await user.click(screen.getByRole('button', { name: 'Hide suggestions' }))
  await waitFor(() =>
    expect(screen.queryByRole('list', { name: 'Suggestions' })).toBeNull(),
  )
  await user.click(screen.getByRole('button', { name: 'Show suggestions' }))
  expect(screen.getByRole('list', { name: 'Suggestions' })).toHaveAttribute(
    'aria-busy',
    'true',
  )
})
