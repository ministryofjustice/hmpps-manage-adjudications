import nock from 'nock'
import { Readable } from 'stream'
import { serviceCheckFactory } from './healthCheck'
import { AgentConfig } from '../config'

describe('Service healthcheck', () => {
  const healthcheck = serviceCheckFactory('externalService', 'http://test-service.com/ping', new AgentConfig(), {
    response: 100,
    deadline: 150,
  })

  let fakeServiceApi: nock.Scope

  beforeEach(() => {
    fakeServiceApi = nock('http://test-service.com')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Check healthy', () => {
    it('Should return data from api', async () => {
      fakeServiceApi.get('/ping').reply(200, 'pong')

      const output = await healthcheck()
      expect(output).toEqual('OK')
    })
  })

  describe('Check unhealthy', () => {
    it('Should throw error from api', async () => {
      fakeServiceApi.get('/ping').thrice().reply(500)

      await expect(healthcheck()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('Check healthy retry test', () => {
    it('Should retry twice if request fails', async () => {
      fakeServiceApi
        .get('/ping')
        .reply(500, { failure: 'one' })
        .get('/ping')
        .reply(500, { failure: 'two' })
        .get('/ping')
        .reply(200, 'pong')

      const response = await healthcheck()
      expect(response).toEqual('OK')
    })

    it('Should retry twice if request times out', async () => {
      fakeServiceApi
        .get('/ping')
        .times(2)
        // eslint-disable-next-line no-empty-function
        .reply(200, () => new Readable({ read() {} }))
        .get('/ping')
        .reply(200, 'pong')

      const response = await healthcheck()
      expect(response).toEqual('OK')
    })

    it('Should fail if request times out three times', async () => {
      fakeServiceApi
        .get('/ping')
        .times(3)
        // eslint-disable-next-line no-empty-function
        .reply(200, () => new Readable({ read() {} }))

      await expect(healthcheck()).rejects.toMatchObject({ code: 'ECONNABORTED' })
      expect(fakeServiceApi.isDone()).toBe(true) // all three attempts were made
    })
  })
})
