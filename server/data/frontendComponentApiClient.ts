import RestClient from './restClient'
import config from '../config'
import FrontendComponent, { AvailableComponent } from '../@types/template'

export default class FrontendComponentApiClient {
  private static restClient(token: string): RestClient {
    return new RestClient('Frontend Component API', config.apis.frontendComponents, token)
  }

  getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string
  ): Promise<Record<T[number], FrontendComponent>> {
    return FrontendComponentApiClient.restClient(userToken).get<Record<T[number], FrontendComponent>>({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
