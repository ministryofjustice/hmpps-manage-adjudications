import { PrivilegeType, PunishmentType } from '../data/PunishmentResult'
import PunishmentBatchSessionService from './punishmentBatchSessionService'

describe('PunishmentBatchSessionService', () => {
  const service = new PunishmentBatchSessionService()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newRequest = (session: Record<string, unknown> = {}): any => ({ session })

  const canteen = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN }
  const library = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'library' }

  it('falls back to the award punishments page when there is no batch', () => {
    expect(service.nextUrl(newRequest(), '100')).toEqual('/award-punishments/100/modified')
  })

  it('moves through the unanswered items then to the schedule', () => {
    const req = newRequest()
    service.start(req, '100', [canteen, library])
    expect(service.nextUrl(req, '100')).toEqual('/punishment-duration/100')
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toEqual(0)

    service.markItemAnswered(req, '100', 0, 'a')
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toEqual(1)
    expect(service.includes(req, '100', 'a')).toBe(true)

    service.markItemAnswered(req, '100', 1, 'b')
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toBeUndefined()
    expect(service.nextUrl(req, '100')).toEqual('/punishment-schedule/100')
  })

  it('replaces an earlier batch and keeps charges apart', () => {
    const req = newRequest()
    service.start(req, '100', [canteen])
    service.markItemAnswered(req, '100', 0, 'a')
    service.start(req, '200', [library])
    service.start(req, '100', [library])

    expect(service.get(req, '100')).toEqual({
      items: [{ ...library, batchItemId: expect.any(String) }],
    })
    expect(service.get(req, '200')).toEqual({
      items: [{ ...library, batchItemId: expect.any(String) }],
    })
  })

  it('gives every item an id of its own, new for each batch', () => {
    const req = newRequest()
    service.start(req, '100', [canteen, library])
    const firstIds = service.get(req, '100').items.map(item => item.batchItemId)
    service.start(req, '100', [canteen, library])
    const secondIds = service.get(req, '100').items.map(item => item.batchItemId)

    expect(new Set([...firstIds, ...secondIds]).size).toEqual(4)
  })

  it('records whether one answer applies to all items', () => {
    const req = newRequest()
    service.start(req, '100', [canteen, library])
    service.setSameForAll(req, '100', true)
    expect(service.get(req, '100').sameForAll).toBe(true)
  })

  it('asks about saved items again when the answer changes, keeping their rows', () => {
    const req = newRequest()
    service.start(req, '100', [canteen, library])
    service.setSameForAll(req, '100', false)
    service.markItemAnswered(req, '100', 0, 'a')
    service.markItemAnswered(req, '100', 1, 'b')
    expect(service.nextUrl(req, '100')).toEqual('/punishment-schedule/100')

    // the same answer again changes nothing
    service.setSameForAll(req, '100', false)
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toBeUndefined()

    service.setSameForAll(req, '100', true)
    expect(service.nextUrl(req, '100')).toEqual('/punishment-duration/100')
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toEqual(0)
    expect(service.get(req, '100').items.map(item => item.redisId)).toEqual(['a', 'b'])

    service.markItemAnswered(req, '100', 0, 'a')
    service.markItemAnswered(req, '100', 1, 'b')
    expect(service.nextUnansweredIndex(service.get(req, '100'))).toBeUndefined()
    expect(service.includes(req, '100', 'a')).toBe(true)
  })
})
