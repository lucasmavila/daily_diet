import { FastifyInstance } from 'fastify'
import { usersRoutes } from './usersRoutes'
import { mealsRoutes } from './mealsRoutes'

export default function useRoutes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: 'users' })
  app.register(mealsRoutes, { prefix: 'meals' })
}
