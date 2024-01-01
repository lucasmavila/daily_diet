import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../../src/app'
import request from 'supertest'
import { getSessionCookie } from '../../src/utils/getSessionIdFromCookie'
import { EditMeal } from '../../src/entities/meal'

describe.skip('Meals Routes', () => {
  beforeAll(async () => {
    app.ready()
  })

  afterAll(async () => {
    app.close()
  })

  let sessionCookie: string | undefined

  const today = new Date()
  const followingDay = today.getDate() + 1
  const followingDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    followingDay,
  ).toISOString()

  const newMeal = {
    name: 'Jantar',
    description: 'Jantar com os amigos',
    onDiet: true,
    dateAndTime: today.toISOString(),
  }

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')

    const newUser = {
      email: 'joao@mail.com',
      password: '123456',
    }

    await request(app.server).post('/users').send(newUser)

    const response = await request(app.server)
      .post('/users/login')
      .send(newUser)

    sessionCookie = getSessionCookie(response)
  })

  it('should be possible to record a meal eaten', async () => {
    if (!sessionCookie) {
      throw new Error('sessionCookie is null')
    }
    await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)
  })

  it.each([
    {
      scenario: 'name correct',
      name: 'Jantar alterado',
      statusCodeExpected: 200,
    },
    {
      scenario: 'description correct',
      description: 'Jantar com os amigos alterado',
      statusCodeExpected: 200,
    },
    {
      scenario: 'onDiet correct',
      onDiet: false,
      statusCodeExpected: 200,
    },
    {
      scenario: 'dateAndTime correct',
      dateAndTime: followingDate,
      statusCodeExpected: 200,
    },
    {
      scenario: 'name incorrect',
      name: 123,
      statusCodeExpected: 400,
    },
    {
      scenario: 'description incorrect',
      description: 123,
      statusCodeExpected: 400,
    },
    {
      scenario: 'onDiet incorrect',
      onDiet: 123,
      statusCodeExpected: 400,
    },
    {
      scenario: 'dateAndTime incorrect',
      dateAndTime: 123,
      statusCodeExpected: 400,
    },
  ])(
    'should be possible to edit a meal: $scenario',
    async ({ name, description, onDiet, dateAndTime, statusCodeExpected }) => {
      if (!sessionCookie) {
        throw new Error('sessionCookie is null')
      }
      const created = await request(app.server)
        .post('/meals')
        .set('Cookie', [sessionCookie])
        .send(newMeal)
        .expect(201)

      const data: EditMeal = {}
      if (name) data.name = name
      if (description) data.description = description
      if (onDiet) data.onDiet = onDiet
      if (dateAndTime) data.dateAndTime = dateAndTime

      const response = await request(app.server)
        .put(`/meals/${created.body.id}`)
        .set('Cookie', [sessionCookie])
        .send(data)

      expect(response.statusCode).toBe(statusCodeExpected)
    },
  )

  it('should be possible to delete a meal', async () => {
    if (!sessionCookie) {
      throw new Error('sessionCookie is null')
    }
    const createdMeal = await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)

    const response = await request(app.server)
      .delete(`/meals/${createdMeal.body.id}`)
      .set('Cookie', [sessionCookie])

    expect(response.statusCode).toBe(204)
  })

  it('should be possible to list all of a users meals', async () => {
    if (!sessionCookie) {
      throw new Error('sessionCookie is null')
    }
    await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)

    const getAllMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', [sessionCookie])
      .expect(200)

    expect(getAllMeals.body.data).toHaveLength(2)
  })

  it('should be possible to view a single meal', async () => {
    if (!sessionCookie) {
      throw new Error('sessionCookie is null')
    }
    const createdMeal = await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)

    const getMeal = await request(app.server)
      .get(`/meals/${createdMeal.body.id}`)
      .set('Cookie', [sessionCookie])
      .expect(200)
    const body = getMeal.body

    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('userId')
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('description')
    expect(body).toHaveProperty('onDiet')
    expect(body).toHaveProperty('createdAt')
    expect(body).toHaveProperty('updatedAt')
  })

  it('should be possible to retrieve a users metrics', async () => {
    if (!sessionCookie) {
      throw new Error('sessionCookie is null')
    }
    await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send(newMeal)
      .expect(201)
    await request(app.server)
      .post('/meals')
      .set('Cookie', [sessionCookie])
      .send({ ...newMeal, onDiet: false })
      .expect(201)

    const getMeal = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', [sessionCookie])
      .expect(200)
    const body = getMeal.body
    console.log(body)

    expect(body).toHaveProperty('numberOfMealsOnDiet')
    expect(body).toHaveProperty('numberOfMealsNotOnDiet')
    expect(body).toHaveProperty('bestOnDietSequence')
    expect(body).toHaveProperty('total')
    expect(body.numberOfMealsOnDiet).toBe(1)
    expect(body.numberOfMealsNotOnDiet).toBe(1)
    expect(body.bestOnDietSequence).toBe(1)
    expect(body.total).toBe(2)
  })
})
