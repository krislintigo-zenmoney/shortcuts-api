import { randomUUID } from 'node:crypto'

import type { ISODateString, Transaction } from '@krislintigo-zenmoney/zenmoney-client'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { zenMoneyClient } from '../api/zenmoney'
import { ZenmoneyToken } from '../schemas/common.schema'
import { ServerError } from '../utils/error'

export const AddTransactionViaApplePayBodySchema = z.object({
  token: ZenmoneyToken,
  amount: z.string(),
  card: z.string(),
  merchant: z.string(),
  name: z.string(),
  date: z.iso.datetime({ offset: true }),
})
export type AddTransactionViaApplePayBody = z.infer<typeof AddTransactionViaApplePayBodySchema>

export const addTransactionViaApplePayHandler = async (
  request: FastifyRequest<{ Body: AddTransactionViaApplePayBody }>,
  reply: FastifyReply,
) => {
  // TODO: find out how to use `name`
  const { token: accessToken, merchant } = request.body

  const [rawSum, currency] = request.body.amount.split(' ')

  if (!rawSum || !currency) {
    throw new ServerError('Invalid amount', { statusCode: 400 })
  }

  const sum = parseFloat(rawSum.replaceAll(',', '.'))

  const transactionDate = request.body.date.split('T')[0]

  if (!transactionDate) {
    throw new ServerError('Invalid date', { statusCode: 400 })
  }

  const card = request.body.card.replaceAll(' ', '_')

  const timestamp = Math.round(Date.now() / 1000)

  const [
    { user: users, account: accounts },
    { tag: suggestedCategories = null, merchant: suggestedMerchant = null },
  ] = await Promise.all([
    zenMoneyClient.diff({
      accessToken,
      currentClientTimestamp: timestamp,
      serverTimestamp: timestamp,
      forceFetch: ['user', 'account'],
    }),
    zenMoneyClient.suggest({ accessToken, payload: { originalPayee: merchant } }),
  ])

  const mainUser = users.find(({ parent }) => parent === null)

  if (!mainUser) {
    throw new Error('Main user not found (impossible)')
  }

  const account = accounts.find(({ syncID }) => syncID?.includes(card))

  if (!account) {
    throw new ServerError('Account not found', { statusCode: 418 })
  }

  const transaction: Transaction = {
    id: randomUUID(),
    created: timestamp,
    changed: timestamp,
    user: mainUser.id,
    deleted: false,
    hold: null,
    viewed: false,

    incomeInstrument: account.instrument,
    incomeAccount: account.id,
    income: 0,

    outcomeInstrument: account.instrument,
    outcomeAccount: account.id,
    outcome: sum,

    // TODO: clarify amounts
    opIncome: null,
    opIncomeInstrument: null,
    opOutcome: null,
    opOutcomeInstrument: null,

    tag: suggestedCategories,
    merchant: suggestedMerchant,
    payee: merchant,
    originalPayee: merchant,
    comment: null,

    date: transactionDate as ISODateString,
    mcc: null,

    reminderMarker: null,
    latitude: null,
    longitude: null,
    qrCode: null,
    source: null,
    incomeBankID: null,
    outcomeBankID: null,
  }

  console.log(transaction)

  const modifiedAccount = structuredClone(account)
  modifiedAccount.balance = Math.round((modifiedAccount.balance - sum) * 10000) / 10000

  await zenMoneyClient.diff({
    accessToken,
    currentClientTimestamp: timestamp,
    serverTimestamp: timestamp,
    account: [modifiedAccount],
    transaction: [transaction],
  })

  reply.status(200).send({ success: true })
}
