import FrontendComponentApiClient from '../data/frontendComponentApiClient'
import FrontendComponent from '../@types/template'

export default class FrontendComponentService {
  constructor(private readonly frontendApiClient: FrontendComponentApiClient) {}

  async getFrontendComponent(component: 'header' | 'footer', userToken: string): Promise<FrontendComponent> {
    return this.frontendApiClient.getComponent(component, userToken)
  }
}
