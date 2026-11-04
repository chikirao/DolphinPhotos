import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getExpiryLabel, nextLocalMidnightDelay } from '../src/lib/expiry-date.ts'

test('uses the local calendar across month and year boundaries', () => {
  assert.equal(getExpiryLabel(new Date(2026, 10, 4)), 'EXPIRES NOVEMBER 4')
  assert.equal(getExpiryLabel(new Date(2026, 11, 31, 23, 59)), 'EXPIRES DECEMBER 31')
  assert.equal(getExpiryLabel(new Date(2027, 0, 1)), 'EXPIRES JANUARY 1')
})

test('an invalid date falls back to NEVER', () => {
  assert.equal(getExpiryLabel(new Date(NaN)), 'EXPIRES NEVER')
})

test('schedules an update at the next local midnight', () => {
  const delay = nextLocalMidnightDelay()
  assert.ok(delay > 0 && delay <= 25 * 60 * 60 * 1000 + 50)
})
