import { validate } from '../utils/validate.js'

import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

export const validateBody =
  (schema: z.ZodType) =>
  (request: FastifyRequest, _reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    // eslint-disable-next-line no-param-reassign
    request.body = validate(request.body, schema)
    done()
  }
