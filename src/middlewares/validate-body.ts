import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import { validate } from '../utils/validate'

export const validateBody =
  (schema: z.ZodType) =>
  (request: FastifyRequest, _reply: FastifyReply, done: DoneFuncWithErrOrRes) => {
    request.body = validate(request.body, schema)
    done()
  }
