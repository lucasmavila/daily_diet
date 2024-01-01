import { execSync } from 'node:child_process'
import { it, describe, beforeEach, afterAll, beforeAll, expect } from 'vitest'
import app from '../../src/app'
import request from 'supertest'
import { getSessionIdFromCookies } from '../../src/utils/getSessionIdFromCookie'

describe.skip('Users Routes', () => {
  beforeAll(async () => {
    app.ready()
  })

  afterAll(async () => {
    app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be possible to create a user', async () => {
    const newUser = {
      email: 'joao@mail.com',
      password: '123456',
    }

    await request(app.server).post('/users').send(newUser).expect(201)
  })

  it('should be possible to identify the user between requests', async () => {
    const newUser = {
      email: 'joao@mail.com',
      password: '123456',
    }

    await request(app.server).post('/users').send(newUser)

    const response = await request(app.server)
      .post('/users/login')
      .send(newUser)

    expect(response.headers).toHaveProperty('set-cookie')

    const sessionId = getSessionIdFromCookies(response)

    expect(sessionId).not.toBeUndefined()
  })
})
