import { getAgeInSeconds } from '../utils/dateDiff'
import { FastifyReply, FastifyRequest } from 'fastify'
import { randomUUID } from 'crypto'
import { DataBaseService } from '../services/DataBaseService'
import { Session } from '../entities/session'

export const maxAgeAuthTokenInSeconds = 60 * 30 // 10 minutes

export class AuthController {
  dataBaseService: DataBaseService
  constructor(dataBaseService: DataBaseService) {
    this.dataBaseService = dataBaseService
  }

  async createSession(userId: string) {
    const oldSessions = await this.dataBaseService.getAll<Session>('sessions', {
      userId,
    })

    if (oldSessions.length > 0) {
      await this.dataBaseService.deleteAll('sessions', { userId })
    }

    const id = randomUUID()

    await this.dataBaseService.create('sessions', { id, userId })

    return id
  }

  async getUserId(request: FastifyRequest) {
    const sessionId = request.cookies.sessionId
    if (!sessionId) {
      throw new Error('User not finded')
    }

    const session = await this.dataBaseService.getById<Session>(
      'sessions',
      sessionId,
    )

    if (!session) {
      throw new Error('User not finded')
    }

    return session.userId
  }

  async auth(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    try {
      const session = await this.dataBaseService.getById<Session>(
        'sessions',
        sessionId,
      )

      if (!session) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const ageInSeconds = getAgeInSeconds(session.createdAt)

      if (ageInSeconds > maxAgeAuthTokenInSeconds) {
        await this.dataBaseService.delete('sessions', sessionId)
        reply.clearCookie('sessionId')

        return reply.status(401).send({ message: 'Unauthorized' })
      }
    } catch (error) {
      console.error(error)
      reply.status(500).send({ message: 'Internal Server Error' })
    }
  }
}
