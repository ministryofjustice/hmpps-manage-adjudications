/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}
}
