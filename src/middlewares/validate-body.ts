import type { RouteShorthandOptions } from 'fastify'
import type { z } from 'zod'

import { validate } from '../utils/validate'

export const validateBody = (schema: z.ZodType): RouteShorthandOptions => ({
  preValidation: (request, _reply, done) => {
    request.body = validate(request.body, schema)
    done()
  },
})
