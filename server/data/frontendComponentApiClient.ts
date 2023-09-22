import RestClient from './restClient'
import config from '../config'
import FrontendComponent from '../@types/template'

export default class FrontendComponentApiClient {
  private static restClient(token: string): RestClient {
    return new RestClient('Frontend Component API', config.apis.frontendComponents, token)
  }

  async getComponent(component: 'header' | 'footer', userToken: string): Promise<FrontendComponent> {
    return FrontendComponentApiClient.restClient(userToken).get({
      path: `/${component}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
