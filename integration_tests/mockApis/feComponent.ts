import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubFeComponents = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/feComponent/components\\?component=header&component=footer&component=meta',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        header: {
          html: '<header><h1>Common Components Header</h1><a data-qa="signOut" class="hmpps-header__link hmpps-header__link--no-underline hmpps-header__sign-out" href="/sign-out">Sign out</a></header>',
          javascript: ['http://localhost:9091/components/header.js'],
          css: ['http://localhost:9091/components/header.css'],
        },
        footer: {
          html: '<footer><h1>Common Components Footer</h1></footer>',
          javascript: ['http://localhost:9091/components/footer.js'],
          css: ['http://localhost:9091/components/footer.css'],
        },
        meta: {
          activeCaseLoad: {
            caseLoadId: 'MDI',
            description: 'Moorland (HMP & YOI)',
          },
        },
      },
    },
  })

const stubFeComponentsCss = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/feComponent/components/.+css',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/css',
      },
      body: '',
    },
  })

const stubFeComponentsJs = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/feComponent/components/.+js',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/js',
      },
      body: '',
    },
  })

const stubFeComponentsFail = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/feComponent/components/header',
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

export default {
  stubFeComponents,
  stubFeComponentsCss,
  stubFeComponentsJs,
  stubFeComponentsFail,
}
