import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, z } from 'zod'
import { getBodyValidationErrorMessage } from './ErrorController'
import { randomUUID } from 'crypto'
import { Meal, NewMeal } from '../entities/meal'
import { AuthController } from './AuthController'
import { DataBaseService } from '../services/DataBaseService'

export class MealsController {
  authController: AuthController
  dataBaseService: DataBaseService
  constructor(
    authController: AuthController,
    dataBaseService: DataBaseService,
  ) {
    this.authController = authController
    this.dataBaseService = dataBaseService
  }

  async createMeal(request: FastifyRequest, reply: FastifyReply) {
    const createMealBodySchema = z.object({
      name: z.string().min(5),
      description: z.string().min(10),
      onDiet: z.boolean(),
      dateAndTime: z.string().datetime(),
    })

    try {
      const userId = await this.authController.getUserId(request)
      const body = createMealBodySchema.parse(request.body)
      const id = randomUUID()

      await this.dataBaseService.create<NewMeal>('meals', {
        id,
        userId,
        ...body,
      })

      const result = await await this.dataBaseService.getById('meals', id)

      reply.status(201).send(result)
    } catch (error) {
      if (error instanceof ZodError) {
        const message = getBodyValidationErrorMessage(error)
        return reply.status(400).send({ message })
      }
      reply.status(500).send({ message: error })
    }
  }

  async getMeals(request: FastifyRequest, reply: FastifyReply) {
    const userId = await this.authController.getUserId(request)
    const getMealsQueryParamsSchema = z.object({
      page: z.string().optional(),
      size: z.string().optional(),
    })
    const { page, size } = getMealsQueryParamsSchema.parse(request.query)
    const pageNumber = Number(page ?? 1)
    const pageSize = Number(size ?? 5)
    const offset = (pageNumber - 1) * pageSize

    console.log(offset, pageNumber, pageSize)

    const result = await this.dataBaseService.getPaginated(
      'meals',
      { userId },
      offset,
      pageSize,
    )

    reply.status(200).send({ data: result })
  }

  async getMealById(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      id: z.string(),
    })

    try {
      const userId = await this.authController.getUserId(request)
      const { id } = paramsSchema.parse(request.params)

      const result = await this.dataBaseService.getFirst('meals', {
        userId,
        id,
      })

      if (!result) {
        reply.status(404).send({ message: 'Not Found' })
      }
      reply.status(200).send(result)
    } catch (error) {
      if (error instanceof ZodError) {
        const message = getBodyValidationErrorMessage(error)
        return reply.status(400).send({ message })
      }
      reply.status(500).send({ message: error })
    }
  }

  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = await this.authController.getUserId(request)

      const numberOfMealsOnDiet = await this.dataBaseService.countWhere(
        'meals',
        { userId, onDiet: true },
      )
      const numberOfMealsNotOnDiet = await this.dataBaseService.countWhere(
        'meals',
        { userId, onDiet: false },
      )

      const totalMeals = await this.dataBaseService.getAll<Meal>('meals', {
        userId,
      })

      const total = totalMeals.length

      const bestOnDietSequence =
        await MealsController.countBestSequence(totalMeals)

      reply.status(200).send({
        numberOfMealsOnDiet,
        numberOfMealsNotOnDiet,
        bestOnDietSequence,
        total,
      })
    } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
        const message = getBodyValidationErrorMessage(error)
        return reply.status(400).send({ message })
      }
      reply.status(500).send({ message: error })
    }
  }

  async updateMeal(request: FastifyRequest, reply: FastifyReply) {
    const editMealBodySchema = z.object({
      name: z.string().min(5).optional(),
      description: z.string().min(10).optional(),
      onDiet: z.boolean().optional(),
      dateAndTime: z.string().datetime().optional(),
    })

    const paramsSchema = z.object({
      id: z.string(),
    })

    try {
      const userId = await this.authController.getUserId(request)
      const { id } = paramsSchema.parse(request.params)
      const body = editMealBodySchema.parse(request.body)

      const savedMeal = await this.dataBaseService.getFirst('meals', {
        userId,
        id,
      })
      if (!savedMeal) {
        reply.status(404).send({ message: 'Not Found' })
      }

      await this.dataBaseService.update('meals', id, body)

      const result = await this.dataBaseService.getById('meals', id)

      reply.status(200).send(result)
    } catch (error) {
      if (error instanceof ZodError) {
        const message = getBodyValidationErrorMessage(error)
        return reply.status(400).send({ message })
      }
      reply.status(500).send({ message: error })
    }
  }

  async deleteMeal(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      id: z.string(),
    })

    try {
      const userId = await this.authController.getUserId(request)
      const { id } = paramsSchema.parse(request.params)

      const savedMeal = await this.dataBaseService.getFirst('meals', {
        userId,
        id,
      })
      if (!savedMeal) {
        reply.status(404).send({ message: 'Not Found' })
      } else {
        await this.dataBaseService.delete('meals', id)
      }
      reply.status(204).send()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = getBodyValidationErrorMessage(error)
        return reply.status(400).send({ message })
      }
      reply.status(500).send({ message: error })
    }
  }

  static async countBestSequence(totalMeals: Meal[]) {
    let currentSequence = 0
    let bestOnDietSequence = 0

    totalMeals.forEach((meal) => {
      if (meal.onDiet) {
        currentSequence += 1
      } else {
        currentSequence = 0
      }

      if (currentSequence > bestOnDietSequence) {
        bestOnDietSequence = currentSequence
      }
    })

    return bestOnDietSequence
  }
}
