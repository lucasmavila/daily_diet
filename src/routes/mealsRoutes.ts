import { FastifyInstance } from 'fastify'
import { authController, mealsController } from '../config'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.getMeals(request, reply),
  )
  app.get(
    '/:id',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.getMealById(request, reply),
  )
  app.get(
    '/summary',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.getSummary(request, reply),
  )
  app.post(
    '/',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.createMeal(request, reply),
  )
  app.delete(
    '/:id',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.deleteMeal(request, reply),
  )
  app.put(
    '/:id',
    { preHandler: (request, reply) => authController.auth(request, reply) },
    (request, reply) => mealsController.updateMeal(request, reply),
  )
}
