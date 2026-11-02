import type { RehabilitativeActivity } from '../data/PunishmentResult'
import { PrivilegeType, PunishmentType } from '../data/PunishmentResult'
import PunishmentsService from './punishmentsService'
import RehabBatchSessionService from './rehabBatchSessionService'

describe('RehabBatchSessionService', () => {
  const punishmentsService = new PunishmentsService(null, null)
  const service = new RehabBatchSessionService(punishmentsService)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newRequest = (session: Record<string, unknown> = {}): any => ({ session })

  const canteen = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN }

  const suspended = (redisId: string, rehabilitativeActivities: RehabilitativeActivity[] = []) => ({
    ...canteen,
    redisId,
    duration: 10,
    suspendedUntil: '2026-11-30',
    rehabilitativeActivities,
  })

  it('falls back to the award punishments page when there is no batch', () => {
    expect(service.nextUrl(newRequest(), '100')).toEqual('/award-punishments/100/modified')
  })

  it('asks about each punishment in turn then shows the schedule', () => {
    const req = newRequest()
    service.start(req, '100', ['a', 'b'])
    expect(service.nextUrl(req, '100')).toEqual('/punishment-has-rehabilitative-activities-details/100/a')

    service.completeItem(req, '100', 'a')
    expect(service.nextUrl(req, '100')).toEqual('/punishment-has-rehabilitative-activities-details/100/b')

    service.completeItem(req, '100', 'b')
    expect(service.nextUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')
  })

  it('knows whether a form belongs to the current batch', () => {
    const req = newRequest()
    expect(service.isCurrentForm(req, '100', 'a', undefined)).toBe(false)

    service.start(req, '100', ['a', 'b'])
    const { id } = service.get(req, '100')
    expect(service.isCurrentForm(req, '100', 'a', id)).toBe(true)
    expect(service.isCurrentForm(req, '100', 'c', id)).toBe(false)
    expect(service.isCurrentForm(req, '100', 'a', undefined)).toBe(false)

    service.start(req, '100', ['a', 'c'])
    expect(service.isCurrentForm(req, '100', 'a', id)).toBe(false)
  })

  it('ignores a punishment that is not in the batch', () => {
    const req = newRequest()
    service.start(req, '100', ['a'])
    service.completeItem(req, '100', 'z')
    expect(service.get(req, '100').completedRedisIds).toEqual([])
  })

  it('copies the activities to every punishment when one answer applies to all', () => {
    const activity = { sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01', id: 9 }
    const req = newRequest({ punishments: { 100: [suspended('a', [activity]), suspended('b')] } })
    service.start(req, '100', ['a', 'b'])
    service.setSameForAll(req, '100', true)

    service.completeItem(req, '100', 'a')

    expect(service.nextUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')
    expect(punishmentsService.getSessionPunishment(req, '100', 'b').rehabilitativeActivities).toEqual([
      { ...activity, id: undefined },
    ])
  })

  it('asks about the punishments again when the same-activity answer changes, keeping their activities', () => {
    const activity = { sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01' }
    const req = newRequest({ punishments: { 100: [suspended('a', [activity]), suspended('b', [activity])] } })
    service.start(req, '100', ['a', 'b'])
    service.setSameForAll(req, '100', false)
    service.completeItem(req, '100', 'a')
    service.completeItem(req, '100', 'b')
    expect(service.nextUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')

    service.setSameForAll(req, '100', false)
    expect(service.nextUrl(req, '100')).toEqual('/rehabilitative-activities-schedule/100')

    service.setSameForAll(req, '100', true)
    expect(service.nextUrl(req, '100')).toEqual('/punishment-has-rehabilitative-activities-details/100/a')
    expect(punishmentsService.getSessionPunishment(req, '100', 'b').rehabilitativeActivities).toEqual([activity])
  })

  it('no longer takes forms shown for the old same-activity answer', () => {
    const req = newRequest({ punishments: { 100: [suspended('a'), suspended('b')] } })
    service.start(req, '100', ['a', 'b'])
    service.setSameForAll(req, '100', false)
    const { id } = service.get(req, '100')
    service.startDraft(req, '100', 'a')
    service.saveDraftActivity(req, '100', 'a', 1, { sessionId: 1, details: 'Course' })

    service.setSameForAll(req, '100', false)
    expect(service.isCurrentForm(req, '100', 'a', id)).toBe(true)

    service.setSameForAll(req, '100', true)
    expect(service.isCurrentForm(req, '100', 'a', id)).toBe(false)
    expect(service.getDraft(req, '100', 'a')).toBeUndefined()
  })

  it('keeps the activities a punishment has until all the new ones are entered', () => {
    const existing = { sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01', id: 9 }
    const first = { sessionId: 1, details: 'Victim awareness', monitor: 'Ann', endDate: '2026-11-10' }
    const second = { sessionId: 2, details: 'Gym', monitor: 'Jo', endDate: '2026-11-20' }
    const req = newRequest({ punishments: { 100: [suspended('a', [existing])] } })
    service.start(req, '100', ['a'])

    service.startDraft(req, '100', 'a')
    service.saveDraftActivity(req, '100', 'a', 1, first)
    service.saveDraftActivity(req, '100', 'a', 2, second)
    expect(punishmentsService.getSessionPunishment(req, '100', 'a').rehabilitativeActivities).toEqual([existing])
    expect(service.getDraft(req, '100', 'a')).toEqual([first, second])

    service.applyDraft(req, '100', 'a')
    expect(punishmentsService.getSessionPunishment(req, '100', 'a')).toEqual(
      expect.objectContaining({
        isThereRehabilitativeActivities: true,
        hasRehabilitativeActivitiesDetails: true,
        rehabilitativeActivities: [first, second],
      }),
    )
    expect(service.getDraft(req, '100', 'a')).toBeUndefined()
  })

  it('starts the activities afresh when asked again, replacing one entered in place', () => {
    const req = newRequest({ punishments: { 100: [suspended('a')] } })
    service.start(req, '100', ['a'])
    service.startDraft(req, '100', 'a')
    service.saveDraftActivity(req, '100', 'a', 1, { sessionId: 1, details: 'Course' })
    service.saveDraftActivity(req, '100', 'a', 1, { sessionId: 1, details: 'Gym' })
    expect(service.getDraft(req, '100', 'a')).toEqual([{ sessionId: 1, details: 'Gym' }])

    service.startDraft(req, '100', 'a')
    expect(service.getDraft(req, '100', 'a')).toEqual([])
  })
})
