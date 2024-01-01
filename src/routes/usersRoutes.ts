import { FastifyInstance } from 'fastify'
import { usersController } from '../config'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', (request, reply) => usersController.createUser(request, reply))
  app.post('/login', (request, reply) => usersController.login(request, reply))
}
