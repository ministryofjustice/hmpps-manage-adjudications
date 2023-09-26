import FrontendComponentApiClient from '../data/frontendComponentApiClient'
import FrontendComponent from '../@types/template'
import logger from '../../logger'

export default class FrontendComponentService {
  constructor(private readonly frontendApiClient: FrontendComponentApiClient) {}

  async getFrontendComponent(component: 'header' | 'footer', userToken: string): Promise<FrontendComponent> {
    try {
      const frontendComponentResponse = await this.frontendApiClient.getComponent(component, userToken)
      return frontendComponentResponse
    } catch (error) {
      logger.error(`Error retrieving DPS frontend components: ${error}`)
      return error
    }
  }
}
