import { ServerError } from '../utils/error.js'

import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify'

export const checkVersion =
  (targetVersion: string) =>
  (request: FastifyRequest, _reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    const version = request.headers['x-shortcut-version']

    if (version !== targetVersion) {
      throw new ServerError('Invalid shortcut version, please upgrade', { statusCode: 400 })
    }

    done()
  }
