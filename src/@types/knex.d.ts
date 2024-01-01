import { knex } from 'knex'

declare module 'knex/tpes/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
    }
    meals: {
      id: string
      session_id: string
      name: string
      description: string
      on_diet: boolean
      created_at: string
      updated_at: string
    }
  }
}
