import { randomUUID } from 'node:crypto'

import type { ISODateString, Transaction } from '@krislintigo-zenmoney/zenmoney-client'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { zenMoneyClient } from '../api/zenmoney'
import { ZenmoneyToken } from '../schemas/common.schema'

export const AddTransactionBodySchema = z.object({
  token: ZenmoneyToken,
  accountId: z.uuid(),
  categoryId: z.uuid(),
  sum: z.number().positive(),
})
export type AddTransactionBody = z.infer<typeof AddTransactionBodySchema>

export const addTransactionHandler = async (
  request: FastifyRequest<{ Body: AddTransactionBody }>,
  reply: FastifyReply,
) => {
  const { token: accessToken, sum, categoryId, accountId } = request.body

  const transactionAmount = Math.round(sum * 10000) / 10000

  const timestamp = Math.round(Date.now() / 1000)

  const {
    user: users,
    account: accounts,
    tag: tags,
  } = await zenMoneyClient.diff({
    accessToken,
    currentClientTimestamp: timestamp,
    serverTimestamp: timestamp,
    forceFetch: ['user', 'account', 'tag'],
  })

  const mainUser = users.find(({ parent }) => parent === null)
  const account = accounts.find(({ id }) => id === accountId)
  const tag = tags.find(({ id }) => id === categoryId)

  if (!mainUser) {
    throw new Error('Main user not found (impossible)')
  }

  if (!account) {
    throw new Error('Account not found')
  }

  if (!tag) {
    throw new Error('Category not found')
  }

  const now = new Date()
  const date: ISODateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  const transaction: Transaction = {
    id: randomUUID(),
    created: timestamp,
    changed: timestamp,
    user: mainUser.id,
    deleted: false,
    hold: null,
    viewed: false,

    incomeInstrument: account.instrument,
    incomeAccount: accountId,
    income: 0,

    outcomeInstrument: account.instrument,
    outcomeAccount: accountId,
    outcome: sum,

    opIncome: null,
    opIncomeInstrument: null,
    opOutcome: null,
    opOutcomeInstrument: null,

    tag: [tag.id],
    merchant: null,
    payee: null,
    originalPayee: null,
    comment: null,

    date,
    mcc: null,

    reminderMarker: null,
    latitude: null,
    longitude: null,
    qrCode: null,
    source: null,
    incomeBankID: null,
    outcomeBankID: null,
  }

  const modifiedAccount = structuredClone(account)
  modifiedAccount.balance =
    Math.round((modifiedAccount.balance - transactionAmount) * 10000) / 10000

  await zenMoneyClient.diff({
    accessToken,
    currentClientTimestamp: timestamp,
    serverTimestamp: timestamp,
    account: [modifiedAccount],
    transaction: [transaction],
  })

  reply.status(200).send({ success: true })
}
