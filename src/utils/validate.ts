import type { z } from 'zod'
import { ZodError } from 'zod'

import { ServerError } from './error'

export const validate = <S extends z.ZodType>(data: unknown, schema: S): z.infer<S> => {
  try {
    return schema.parse(data)
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(error)
      throw new ServerError('Validation error', { statusCode: 400 })
    }
    throw error
  }
}
