import { isPlainObject } from '../utils/is-object'

export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms))
}

export const jitter = (ms: number): number => {
  // eslint-disable-next-line sonarjs/pseudo-random
  const j = ms * (0.2 * (Math.random() - 0.5) * 2) // +/-20%
  return Math.max(0, Math.floor(ms + j))
}

export const checkRetryableStatus = (status: number): boolean => {
  return status === 408 || status === 409 || status === 429 || (status >= 500 && status <= 599)
}

export const parseRetryAfterMs = (headers: Headers): number | null => {
  const v = headers.get('retry-after')
  if (!v) return null
  const s = Number(v)
  if (!Number.isFinite(s)) return null
  return Math.max(0, s * 1000)
}

export const withRetry = async <T>(
  callback: (ac: AbortController) => Promise<Response>,
  { timeoutMs, maxRetries }: { timeoutMs: number; maxRetries: number },
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  let attempt = 0
  let backoff = 500 // ms

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    attempt++

    const ac = new AbortController()
    const timeout = setTimeout(() => {
      ac.abort()
    }, timeoutMs)

    try {
      const res = await callback(ac)

      const text = await res.text()
      const contentType = res.headers.get('content-type') ?? ''

      const json =
        text && contentType.includes('application/json')
          ? (JSON.parse(text) as unknown)
          : { raw: text }

      if (!res.ok) {
        console.error(json)
        const msg = `Error (status ${res.status})`

        if (attempt <= maxRetries && checkRetryableStatus(res.status)) {
          const retryAfter = parseRetryAfterMs(res.headers)
          const wait = retryAfter ?? jitter(backoff)
          backoff = Math.min(10_000, backoff * 2)
          await sleep(wait)
          continue
        }

        throw new Error(msg)
      }

      return json as T
    } catch (e) {
      console.error(e)
      const isAbort = isPlainObject(e) && 'name' in e && e.name === 'AbortError'
      const isNetwork = e instanceof TypeError

      if (attempt <= maxRetries && (isAbort || isNetwork)) {
        const wait = jitter(backoff)
        backoff = Math.min(10_000, backoff * 2)
        await sleep(wait)
        continue
      }
      throw e
    } finally {
      clearTimeout(timeout)
    }
  }
}
