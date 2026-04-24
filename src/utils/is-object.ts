export const isPlainObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
