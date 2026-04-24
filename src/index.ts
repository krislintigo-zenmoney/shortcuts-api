import 'dotenv/config'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import Fastify from 'fastify'

import { validateBody } from './middlewares/validate-body'
import type { AddTransactionBody } from './router/add-transaction.handler'
import { AddTransactionBodySchema, addTransactionHandler } from './router/add-transaction.handler'
import type { GetAccountDataBody } from './router/get-account-data.handler'
import { GetAccountDataBodySchema, getAccountDataHandler } from './router/get-account-data.handler'

const app = Fastify()

app.setErrorHandler((error: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
  console.log('error', error.message.split('\n').join(''))
  const statusCode = error.statusCode ?? 500

  if (statusCode < 500) {
    reply.status(statusCode).send({ error: error.name, message: error.message })
    return
  }

  app.log.error({ err: error, requestId: reply.request.id }, 'Unhandled server error')

  reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
    requestId: reply.request.id,
  })
})

app.get('/', (_req, res) => {
  res.send('I am the server')
})

app.post<{ Body: GetAccountDataBody }>(
  '/get-account-data',
  validateBody(GetAccountDataBodySchema),
  getAccountDataHandler,
)

app.post<{ Body: AddTransactionBody }>(
  '/add-transaction',
  validateBody(AddTransactionBodySchema),
  addTransactionHandler,
)

const bootstrap = async () => {
  if (!process.env.PORT) {
    throw new Error('PORT env variable is not set')
  }
  const port = parseInt(process.env.PORT, 10)

  try {
    await app.listen({ port })
    console.log(`Server started on port ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
void bootstrap()
