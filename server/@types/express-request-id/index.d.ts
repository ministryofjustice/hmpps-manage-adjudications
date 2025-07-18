import { RequestHandler } from 'express'

declare function addRequestId(options?: unknown): RequestHandler

export = addRequestId
