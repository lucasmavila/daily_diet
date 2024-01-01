import { SavedEntity } from './saved'

export interface NewUser {
  id: string
  email: string
  password: string
}
export interface User extends SavedEntity, NewUser { }
