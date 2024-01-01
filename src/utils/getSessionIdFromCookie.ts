import { Response } from 'supertest'

export function getSessionIdFromCookies(response: Response) {
  return Array.from(response.headers['set-cookie'])
    .find((value) => value.startsWith('sessionId'))
    ?.split(';')[0]
    .split('=')[1]
}

export function getSessionCookie(response: Response) {
  return Array.from(response.headers['set-cookie']).find((value) =>
    value.startsWith('sessionId'),
  )
}
