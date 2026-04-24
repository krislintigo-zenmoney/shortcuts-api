import { withRetry } from '../common.api'
import type {
  ZenmoneyAccount,
  ZenmoneyTag,
  ZenmoneyTransaction,
  ZenmoneyUser,
} from './zenmoney.types'

interface ZenApiClientOptions {
  baseUrl?: string
  timeoutMs?: number
  maxRetries?: number
  userAgent?: string
}

export class ZenApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly maxRetries: number
  private readonly userAgent: string

  constructor(opts: ZenApiClientOptions) {
    this.baseUrl = opts.baseUrl ?? 'https://api.zenmoney.ru/v8'
    this.timeoutMs = opts.timeoutMs ?? 20_000
    this.maxRetries = opts.maxRetries ?? 3
    this.userAgent = opts.userAgent ?? 'zen-ingest/1.0'
  }

  private async request<T>(
    url: string,
    body: Record<string, unknown> | Record<string, unknown>[],
    { token }: { token: string },
  ): Promise<T> {
    return await withRetry<T>(
      async (ac) => {
        return await fetch(url, {
          method: 'POST',
          signal: ac.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
          },
          body: JSON.stringify(body),
        })
      },
      { timeoutMs: this.timeoutMs, maxRetries: this.maxRetries },
    )
  }

  async diff(
    body: {
      currentClientTimestamp: number
      serverTimestamp: number
      forceFetch?: ('user' | 'account' | 'tag')[]
      account?: ZenmoneyAccount[]
      transaction?: ZenmoneyTransaction[]
    },
    { token }: { token: string },
  ) {
    return this.request<
      Partial<{ user: ZenmoneyUser[]; account: ZenmoneyAccount[]; tag: ZenmoneyTag[] }>
    >(`${this.baseUrl}/diff`, body, { token })
  }

  async suggest(
    body: (Partial<ZenmoneyTransaction> & { tempId: string })[],
    { token }: { token: string },
  ) {
    return this.request<(Partial<ZenmoneyTransaction> & { tempId: string })[]>(
      `${this.baseUrl}/suggest`,
      body,
      { token },
    )
  }
}

export const zenmoneyClient = new ZenApiClient({})
