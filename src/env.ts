import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number(),
})

// eslint-disable-next-line n/no-process-env -- parse env variables here
const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
  throw new Error(z.prettifyError(parseResult.error))
}

export const ENV = parseResult.data
