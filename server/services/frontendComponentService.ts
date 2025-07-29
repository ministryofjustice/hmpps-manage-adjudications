import FrontendComponentApiClient from '../data/frontendComponentApiClient'
import FrontendComponent, { AvailableComponent } from '../@types/template'

export default class FrontendComponentService {
  constructor(private readonly frontendApiClient: FrontendComponentApiClient) {}

  async getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
  ): Promise<Record<T[number], FrontendComponent>> {
    return this.frontendApiClient.getComponents(components, userToken)
  }
}
