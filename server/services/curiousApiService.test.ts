import bunyan from 'bunyan'
import CuriousApiService from './curiousApiService'
import CuriousApiClient from '../data/curiousApiClient'
import { makeNotFoundError } from '../test/helpers'

const getLearnerProfiles = jest.fn()

jest.mock('../data/curiousApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getLearnerProfiles }
  })
})

const token = 'token-1'

describe('curiousApiService', () => {
  let service: CuriousApiService

  beforeEach(() => {
    service = new CuriousApiService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getNeurodiversitiesForReport', () => {
    describe('with valid prisoner number', () => {
      beforeEach(() => {
        getLearnerProfiles.mockResolvedValue([
          {
            prn: 'G6123VU',
            establishmentId: 'MDI',
            uln: '1234123412',
            primaryLDDAndHealthProblem: 'Speech, language and communication needs',
            additionalLDDAndHealthProblems: [
              'Hearing impairment',
              'Social and emotional difficulties',
              'Mental health difficulty',
              'Other difficulty',
            ],
          },
          {
            prn: 'G6123VU',
            establishmentId: 'WDI',
            uln: '9876987654',
            primaryLDDAndHealthProblem: null,
            additionalLDDAndHealthProblems: ['Visual impairment', 'Hearing impairment'],
          },
        ])
      })

      it('returns the correct neurodiversities', async () => {
        const result = await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(result).toEqual(['Speech, language and communication needs', 'Hearing impairment', 'Visual impairment'])
      })

      it('makes the correct calls', async () => {
        await service.getNeurodiversitiesForReport('A1234AA', token)

        expect(CuriousApiClient).toBeCalledWith(token)
        expect(getLearnerProfiles).toBeCalledWith('A1234AA')
      })
    })

    describe('with no data', () => {
      beforeEach(() => {
        getLearnerProfiles.mockResolvedValue([])
      })

      it('returns an empty array', async () => {
        const result = await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(result).toEqual([])
      })
    })

    describe('on curious api error', () => {
      const spyLogError = jest.spyOn(bunyan.prototype, 'error')

      beforeEach(() => {
        getLearnerProfiles.mockRejectedValue(new Error('error message content'))
      })

      it('returns a null value', async () => {
        const result = await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(result).toEqual(null)
      })

      it('logs the error', async () => {
        await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(spyLogError).toHaveBeenCalled()
      })
    })

    describe('on curious 404', () => {
      const spyLogError = jest.spyOn(bunyan.prototype, 'error')

      beforeEach(() => {
        getLearnerProfiles.mockRejectedValue(makeNotFoundError())
      })

      it('returns a null value', async () => {
        const result = await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(result).toEqual(null)
      })

      it('does not log an error', async () => {
        await service.getNeurodiversitiesForReport('G6123VU', token)

        expect(spyLogError).not.toHaveBeenCalled()
      })
    })
  })
})
