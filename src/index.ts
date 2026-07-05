import Fastify from 'fastify'

import { ENV } from './env.js'
import { checkVersion } from './middlewares/check-version.js'
import { validateBody } from './middlewares/validate-body.js'
import {
  AddTransactionViaApplePayBodySchema,
  addTransactionViaApplePayHandler,
  SHORTCUT_VERSION as ADD_TRANSACTION_VIA_APPLE_PAY_VERSION,
} from './router/add-transaction-via-apple-pay.handler.js'
import {
  AddTransactionBodySchema,
  addTransactionHandler,
  SHORTCUT_VERSION as ADD_TRANSACTION_VERSION,
} from './router/add-transaction.handler.js'
import {
  GetAccountDataBodySchema,
  getAccountDataHandler,
  SHORTCUT_VERSION as GET_ACCOUNT_DATA_VERSION,
} from './router/get-account-data.handler.js'

import type { AddTransactionViaApplePayBody } from './router/add-transaction-via-apple-pay.handler.js'
import type { AddTransactionBody } from './router/add-transaction.handler.js'
import type { GetAccountDataBody } from './router/get-account-data.handler.js'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

const app = Fastify()

app.setErrorHandler((error: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
  console.error('error', error.message.replaceAll('\n', ''))

  const statusCode = error.statusCode ?? 500

  if (statusCode < 500) {
    reply.status(statusCode).send({ ok: false, message: error.message })

    return
  }

  app.log.error({ ok: false, err: error, requestId: reply.request.id }, 'Unhandled server error')

  reply.status(500).send({
    ok: false,
    message: 'Something went wrong',
    requestId: reply.request.id,
  })
})

app.get('/', (_req, res) => {
  res.send('I am the server')
})

app.post<{ Body: GetAccountDataBody }>(
  '/get-account-data',
  {
    preValidation: [checkVersion(GET_ACCOUNT_DATA_VERSION), validateBody(GetAccountDataBodySchema)],
  },
  getAccountDataHandler,
)

app.post<{ Body: AddTransactionBody }>(
  '/add-transaction',
  {
    preValidation: [checkVersion(ADD_TRANSACTION_VERSION), validateBody(AddTransactionBodySchema)],
  },
  addTransactionHandler,
)

app.post<{ Body: AddTransactionViaApplePayBody }>(
  '/add-transaction/apple-pay',
  {
    preValidation: [
      checkVersion(ADD_TRANSACTION_VIA_APPLE_PAY_VERSION),
      validateBody(AddTransactionViaApplePayBodySchema),
    ],
  },
  addTransactionViaApplePayHandler,
)

try {
  await app.listen({ port: ENV.PORT })
  console.log(`Server started on port ${ENV.PORT}`)
} catch (error) {
  app.log.error(error)
  process.exitCode = 1
}
