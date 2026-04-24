import { z } from 'zod'

export const ZenmoneyToken = z.string().regex(/^[A-Za-z0-9]{30}$/)
