import { ZodError } from 'zod'

export function getBodyValidationErrorMessage(error: ZodError) {
  return error.errors.map(
    (error) => `${error.path[0]} | ${error.code} | ${error.message}`,
  )
}
