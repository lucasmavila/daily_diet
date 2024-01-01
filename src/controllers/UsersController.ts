import { FastifyReply, FastifyRequest } from 'fastify'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { AuthController, maxAgeAuthTokenInSeconds } from './AuthController'
import { NewUser, User } from '../entities/user'
import { DataBaseService } from '../services/DataBaseService'

export class UsersController {
  authController: AuthController
  dataBaseService: DataBaseService
  constructor(
    authController: AuthController,
    dataBaseService: DataBaseService,
  ) {
    this.authController = authController
    this.dataBaseService = dataBaseService
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const createUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })
    const { email, password } = createUserBodySchema.parse(request.body)

    const savedUser = await this.dataBaseService.getFirst<User>('users', {
      email,
    })

    if (!savedUser) {
      const encryptedPassword = await bcryptjs.hash(password, 8)

      await this.dataBaseService.create<NewUser>('users', {
        id: randomUUID(),
        email,
        password: encryptedPassword,
      })

      return reply.status(201).send()
    } else {
      reply.status(400).send({ message: 'User already registered!' })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const createUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })
    try {
      const { email, password } = createUserBodySchema.parse(request.body)

      const savedUser = await this.dataBaseService.getFirst<User>('users', {
        email,
      })

      if (!savedUser) {
        return reply.status(401).send({ message: 'User not found' })
      }

      const equals = await bcryptjs.compare(password, savedUser.password)

      if (equals) {
        const sessionId = await this.authController.createSession(savedUser.id)

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: maxAgeAuthTokenInSeconds,
        })

        return reply.status(200).send()
      }
    } catch (error) {
      console.log(error)
      reply.status(400)
    }
  }
}
