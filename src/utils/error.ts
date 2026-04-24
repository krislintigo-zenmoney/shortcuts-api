export interface ServerErrorOptions {
  statusCode?: number
  code?: string
  cause?: unknown
  details?: Record<string, unknown>
  expose?: boolean // whether the error should be exposed to the client
}

export class ServerError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly cause?: unknown
  public readonly details?: Record<string, unknown>
  public readonly expose: boolean

  constructor(message: string, options: ServerErrorOptions = {}) {
    super(message)

    this.name = 'ServerError'

    this.statusCode = options.statusCode ?? 500
    this.code = options.code ?? 'INTERNAL_SERVER_ERROR'
    this.cause = options.cause
    this.expose = options.expose ?? false

    if (options.details) {
      this.details = options.details
    }

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
