import FrontendComponent from '../@types/template'
import FrontendComponentApiClient from '../data/frontendComponentApiClient'
import FrontendComponentService from './frontendComponentService'

const getComponents = jest.fn()

jest.mock('../data/frontendComponentApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getComponents }
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
    getComponents.mockResolvedValue({
      html: '<div>Header</div>',
      css: ['https://frontend-componenents-dev/headerStyles.css'],
      javascript: ['https://frontend-componenents-dev/headerScripts.js'],
    } as FrontendComponent)
    const result = await frontendComponentService.getComponents(['header'], token)
    expect(result).toEqual({
      html: '<div>Header</div>',
      css: ['https://frontend-componenents-dev/headerStyles.css'],
      javascript: ['https://frontend-componenents-dev/headerScripts.js'],
    })
  })
  it('footer', async () => {
    getComponents.mockResolvedValue({
      html: '<div>Footer</div>',
      css: ['https://frontend-componenents-dev/footerStyles.css'],
      javascript: ['https://frontend-componenents-dev/footerScripts.js'],
    } as FrontendComponent)
    const result = await frontendComponentService.getComponents(['footer'], token)
    expect(result).toEqual({
      html: '<div>Footer</div>',
      css: ['https://frontend-componenents-dev/footerStyles.css'],
      javascript: ['https://frontend-componenents-dev/footerScripts.js'],
    })
  })
  it('Both', async () => {
    getComponents.mockResolvedValue({
      header: {
        html: '<div>Header</div>',
        css: ['https://frontend-componenents-dev/headerStyles.css'],
        javascript: ['https://frontend-componenents-dev/headerScripts.js'],
      },
      footer: {
        html: '<div>Footer</div>',
        css: ['https://frontend-componenents-dev/footerStyles.css'],
        javascript: ['https://frontend-componenents-dev/footerScripts.js'],
      },
    })
    const result = await frontendComponentService.getComponents(['header', 'footer'], token)
    expect(result).toEqual({
      header: {
        html: '<div>Header</div>',
        css: ['https://frontend-componenents-dev/headerStyles.css'],
        javascript: ['https://frontend-componenents-dev/headerScripts.js'],
      },
      footer: {
        html: '<div>Footer</div>',
        css: ['https://frontend-componenents-dev/footerStyles.css'],
        javascript: ['https://frontend-componenents-dev/footerScripts.js'],
      },
    })
  })
})
