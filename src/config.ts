import { AuthController } from './controllers/AuthController'
import { MealsController } from './controllers/MealsController'
import { UsersController } from './controllers/UsersController'
import { DataBaseService } from './services/DataBaseService'

export const databaseService = new DataBaseService()
export const authController = new AuthController(databaseService)
export const usersController = new UsersController(
  authController,
  databaseService,
)
export const mealsController = new MealsController(
  authController,
  databaseService,
)
