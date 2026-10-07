import { expect, test } from 'vitest'

test('jsdom and jest-dom are wired up', () => {
  document.body.innerHTML = '<p>hi</p>'
  expect(document.querySelector('p')).toBeInTheDocument()
})
