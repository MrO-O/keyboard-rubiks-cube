import { describe, expect, it } from 'vitest'
import { INITIAL_VIEW } from '../view'
import {
  formatMoveLabel,
  getFaceForViewAction,
  shouldPreventDefault,
} from './actions'
import { DEFAULT_KEYMAP, DEFAULT_WIDE_TURN_MODIFIER_KEY } from './defaultKeymap'
import { keyToAction } from './keyToAction'

describe('keyboard controls', () => {
  it('includes default face turn bindings', () => {
    const actions = DEFAULT_KEYMAP.map((binding) => binding.actionId)

    expect(actions).toEqual(
      expect.arrayContaining([
        'turnViewUp',
        'turnViewDown',
        'turnViewLeft',
        'turnViewRight',
        'turnViewFront',
        'turnViewBack',
      ]),
    )
  })

  it.each([
    ['S', 'rotateViewUp'],
    ['W', 'rotateViewDown'],
    ['A', 'rotateViewLeft'],
    ['D', 'rotateViewRight'],
    [' ', 'rollViewClockwise'],
  ])('maps %s to %s', (key, actionId) => {
    expect(keyToAction({ key })).toEqual({ id: actionId })
  })

  it('maps Shift + Space to counterclockwise roll', () => {
    expect(keyToAction({ key: ' ', shiftKey: true })).toEqual({
      id: 'rollViewCounterClockwise',
    })
  })

  it.each(['W', 'A', 'S', 'D'])(
    'treats Shift + %s like its regular view action',
    (key) => {
      expect(keyToAction({ key, shiftKey: true })).toEqual(
        keyToAction({ key }),
      )
    },
  )

  it.each([
    ['E', 'startPeekRight'],
    ['Q', 'startPeekLeft'],
  ])('maps %s keydown to %s', (key, actionId) => {
    expect(keyToAction({ key }, 'keydown')).toEqual({ id: actionId })
  })

  it.each(['Q', 'E'])(
    'does not clear latched peek when %s is released',
    (key) => {
      expect(keyToAction({ key }, 'keyup')).toBeNull()
    },
  )

  it('does not emit keyup actions for regular bindings', () => {
    expect(keyToAction({ key: 'K' }, 'keyup')).toBeNull()
  })

  it('recognizes regular key presses', () => {
    expect(keyToAction({ key: 'o' })).toEqual({
      id: 'turnViewFront',
      direction: 1,
      layers: 1,
    })
  })

  it('uses inverse direction for shift face turns', () => {
    expect(keyToAction({ key: 'O', shiftKey: true })).toEqual({
      id: 'turnViewFront',
      direction: -1,
      layers: 1,
    })
  })

  it('uses semicolon as the default wide modifier', () => {
    expect(DEFAULT_WIDE_TURN_MODIFIER_KEY).toBe('F')
    expect(keyToAction({ key: 'F' }, 'keydown')).toEqual({
      id: 'startWideTurnModifier',
    })
    expect(keyToAction({ key: 'F' }, 'keyup')).toEqual({
      id: 'stopWideTurnModifier',
    })
  })

  it('formats single and wide move notation', () => {
    expect(formatMoveLabel('U', 1)).toBe('U')
    expect(formatMoveLabel('U', -1)).toBe("U'")
    expect(formatMoveLabel('U', 1, 2)).toBe('Uw')
    expect(formatMoveLabel('U', -1, 2)).toBe("Uw'")
  })

  it('creates clockwise and inverse wide turns while the modifier is active', () => {
    expect(keyToAction({ key: 'O' }, 'keydown', DEFAULT_KEYMAP, 'F', true)).toEqual({
      id: 'turnViewFront',
      direction: 1,
      layers: 2,
    })
    expect(
      keyToAction(
        { key: 'O', shiftKey: true },
        'keydown',
        DEFAULT_KEYMAP,
        'F',
        true,
      ),
    ).toEqual({ id: 'turnViewFront', direction: -1, layers: 2 })
  })

  it.each([
    { key: ';', ctrlKey: true },
    { key: ';', metaKey: true },
    { key: ';', altKey: true },
  ])('does not activate wide mode for browser modifiers', (event) => {
    expect(keyToAction(event)).toBeNull()
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
