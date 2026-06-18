import { describe, expect, it } from 'vitest'
import { INITIAL_VIEW } from '../view'
import { getFaceForViewAction, shouldPreventDefault } from './actions'
import { DEFAULT_KEYMAP } from './defaultKeymap'
import { keyToAction } from './keyToAction'

describe('keyboard controls', () => {
  it('includes default face turn bindings', () => {
    const keys = DEFAULT_KEYMAP.map((binding) => binding.key)

    expect(keys).toEqual(expect.arrayContaining(['U', 'I', 'H', 'J', 'K', 'L']))
  })

  it.each([
    ['W', 'rotateViewUp'],
    ['S', 'rotateViewDown'],
    ['A', 'rotateViewLeft'],
    ['D', 'rotateViewRight'],
    [' ', 'rollViewClockwise'],
  ])('maps %s to %s', (key, actionId) => {
    expect(keyToAction({ key })).toEqual({ id: actionId })
  })

  it.each([
    ['Q', 'startPeekRight'],
    ['E', 'startPeekLeft'],
  ])('maps %s keydown to %s', (key, actionId) => {
    expect(keyToAction({ key }, 'keydown')).toEqual({ id: actionId })
  })

  it.each([
    ['Q', 'stopPeekRight'],
    ['E', 'stopPeekLeft'],
  ])('maps %s keyup to %s', (key, actionId) => {
    expect(keyToAction({ key }, 'keyup')).toEqual({ id: actionId })
  })

  it('does not emit keyup actions for regular bindings', () => {
    expect(keyToAction({ key: 'K' }, 'keyup')).toBeNull()
  })

  it('recognizes regular key presses', () => {
    expect(keyToAction({ key: 'k' })).toEqual({
      id: 'turnViewFront',
      direction: 1,
    })
  })

  it('uses inverse direction for shift face turns', () => {
    expect(keyToAction({ key: 'K', shiftKey: true })).toEqual({
      id: 'turnViewFront',
      direction: -1,
    })
  })

  it.each([
    { key: 'K', ctrlKey: true },
    { key: 'K', metaKey: true },
    { key: 'K', altKey: true },
    { key: ' ', ctrlKey: true },
    { key: ' ', metaKey: true },
    { key: ' ', altKey: true },
    { key: 'Q', ctrlKey: true },
    { key: 'E', metaKey: true },
    { key: 'Q', altKey: true },
  ])('does not trigger cube actions for modified shortcuts', (event) => {
    expect(keyToAction(event)).toBeNull()
  })

  it('marks the Space game action for default prevention', () => {
    const action = keyToAction({ key: ' ' })

    expect(action).not.toBeNull()
    expect(shouldPreventDefault(action!)).toBe(true)
  })

  it('maps initial view front to physical F', () => {
    expect(getFaceForViewAction(INITIAL_VIEW, 'turnViewFront')).toBe('F')
  })

  it('maps initial view up to physical U', () => {
    expect(getFaceForViewAction(INITIAL_VIEW, 'turnViewUp')).toBe('U')
  })

  it('maps initial view back to physical B', () => {
    expect(getFaceForViewAction(INITIAL_VIEW, 'turnViewBack')).toBe('B')
  })
})
