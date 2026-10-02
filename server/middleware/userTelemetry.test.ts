import type { Request, Response } from 'express'
import userTelemetry from './userTelemetry'

// the telemetry library sets attributes on the active OpenTelemetry span; it brings @opentelemetry/api as a peer dependency
const { trace } = jest.requireActual<typeof import('@opentelemetry/api')>('@opentelemetry/api')

describe('userTelemetry', () => {
  const setAttribute = jest.fn()
  const next = jest.fn()

  const signedInUser = {
    username: 'TEST_USER',
    userId: '231232',
    userUuid: '11111111-1111-1111-1111-111111111111',
    authSource: 'nomis',
    activeCaseLoadId: 'MDI',
    meta: { caseLoadId: 'MDI' },
  }

  beforeEach(() => {
    jest
      .spyOn(trace, 'getActiveSpan')
      .mockReturnValue({ setAttribute } as unknown as ReturnType<typeof trace.getActiveSpan>)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  function recordedAttributes(user: Record<string, unknown> | undefined): Record<string, unknown> {
    const res = { locals: { user } } as unknown as Response
    userTelemetry()({} as Request, res, next)
    expect(next).toHaveBeenCalled()
    return Object.fromEntries(setAttribute.mock.calls)
  }

  it('records the username, user ids and active caseload of the signed-in user', () => {
    expect(recordedAttributes(signedInUser)).toEqual({
      username: 'TEST_USER',
      userId: '231232',
      userUuid: '11111111-1111-1111-1111-111111111111',
      activeCaseLoadId: 'MDI',
    })
  })

  it('falls back to the caseload from the user metadata', () => {
    expect(recordedAttributes({ ...signedInUser, activeCaseLoadId: undefined, meta: { caseLoadId: 'LEI' } })).toEqual(
      expect.objectContaining({ activeCaseLoadId: 'LEI' }),
    )
  })

  it('leaves out details the user does not have', () => {
    expect(recordedAttributes({ username: 'TEST_USER', authSource: 'nomis', meta: {} })).toEqual({
      username: 'TEST_USER',
    })
  })

  it('records nothing when there is no user', () => {
    expect(recordedAttributes(undefined)).toEqual({})
  })
})
