import FrontendComponent from '../@types/template'
import FrontendComponentApiClient from '../data/frontendComponentApiClient'
import FrontendComponentService from './frontendComponentService'

const getComponent = jest.fn()

jest.mock('../data/frontendComponentApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getComponent }
  })
})

describe('Frontend component service', () => {
  let frontendComponentApiClient: jest.Mocked<FrontendComponentApiClient>
  let frontendComponentService: FrontendComponentService
  const token = 'xyz-token'

  beforeEach(() => {
    frontendComponentApiClient = new FrontendComponentApiClient() as jest.Mocked<FrontendComponentApiClient>
    frontendComponentService = new FrontendComponentService(frontendComponentApiClient)
  })

  it('header', async () => {
    getComponent.mockResolvedValue({
      html: '<div>Header</div>',
      css: ['https://frontend-componenents-dev/headerStyles.css'],
      javascript: ['https://frontend-componenents-dev/headerScripts.js'],
    } as FrontendComponent)
    const result = await frontendComponentService.getFrontendComponent('header', token)
    expect(result).toEqual({
      html: '<div>Header</div>',
      css: ['https://frontend-componenents-dev/headerStyles.css'],
      javascript: ['https://frontend-componenents-dev/headerScripts.js'],
    })
  })
  it('footer', async () => {
    getComponent.mockResolvedValue({
      html: '<div>Footer</div>',
      css: ['https://frontend-componenents-dev/footerStyles.css'],
      javascript: ['https://frontend-componenents-dev/footerScripts.js'],
    } as FrontendComponent)
    const result = await frontendComponentService.getFrontendComponent('footer', token)
    expect(result).toEqual({
      html: '<div>Footer</div>',
      css: ['https://frontend-componenents-dev/footerStyles.css'],
      javascript: ['https://frontend-componenents-dev/footerScripts.js'],
    })
  })
})
