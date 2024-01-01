import { SavedEntity } from './saved'

export interface NewMeal {
  id: string
  userId: string
  name: string
  description: string
  onDiet: boolean
}

export interface Meal extends NewMeal, SavedEntity { }

export interface EditMeal {
  userId?: string
  name?: string
  description?: string
  onDiet?: boolean
  dateAndTime?: string
}
