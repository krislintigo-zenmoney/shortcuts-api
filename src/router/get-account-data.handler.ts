import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { zenMoneyClient } from '../api/zenmoney'
import { ZenmoneyToken } from '../schemas/common.schema'

export const GetAccountDataBodySchema = z.object({
  token: ZenmoneyToken,
})
export type GetAccountDataBody = z.infer<typeof GetAccountDataBodySchema>

export const getAccountDataHandler = async (
  request: FastifyRequest<{ Body: GetAccountDataBody }>,
  reply: FastifyReply,
) => {
  const { token: accessToken } = request.body

  const timestamp = Math.round(Date.now() / 1000)

  const { account: accounts, tag: categories } = await zenMoneyClient.diff({
    accessToken,
    currentClientTimestamp: timestamp,
    serverTimestamp: timestamp,
    forceFetch: ['account', 'tag'],
  })

  reply.status(200).send({
    accounts: accounts.map(({ id, title, type }) => ({ id, title, type })),
    categories: categories.map(({ id, title }) => ({ id, title })),
  })
}
