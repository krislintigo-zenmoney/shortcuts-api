import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { zenmoneyClient } from '../api/zenmoney/zen.api'
import { ZenmoneyToken } from '../schemas/common.schema'

export const GetAccountDataBodySchema = z.object({
  token: ZenmoneyToken,
})
export type GetAccountDataBody = z.infer<typeof GetAccountDataBodySchema>

export const getAccountDataHandler = async (
  request: FastifyRequest<{ Body: GetAccountDataBody }>,
  reply: FastifyReply,
) => {
  const { token } = request.body

  const timestamp = Math.round(Date.now() / 1000)
  const { account: accounts = [], tag: tags = [] } = await zenmoneyClient.diff(
    {
      currentClientTimestamp: timestamp,
      serverTimestamp: timestamp,
      forceFetch: ['account', 'tag'],
    },
    { token },
  )

  reply.status(200).send({
    accounts: accounts.map(({ id, title, type }) => ({ id, title, type })),
    tags: tags.map(({ id, title }) => ({ id, title })),
  })
}
