import { knex } from '../database'

export class DataBaseService {
  async create<T>(table: string, body: T) {
    await knex(table).insert(body)
  }

  async getAll<T>(table: string, where: object): Promise<T[]> {
    return await knex(table).where(where)
  }

  async getPaginated<T>(
    table: string,
    where: object,
    offset?: number,
    limit?: number,
  ): Promise<T[]> {
    return await knex(table)
      .where(where)
      .offset(offset ?? 0)
      .limit(limit ?? 30)
  }

  async getFirst<T>(table: string, where: object): Promise<T> {
    return await knex(table).where(where).first()
  }

  async getById<T>(table: string, id: string): Promise<T> {
    return await knex(table).where({ id }).first()
  }

  async update<T>(table: string, id: string, body: T) {
    await knex(table)
      .where({ id })
      .update({ ...body, updatedAt: knex.fn.now() })
  }

  async updateAll<T>(table: string, where: object, body: T) {
    await knex(table)
      .where(where)
      .update({ ...body, updatedAt: knex.fn.now() })
  }

  async delete(table: string, id: string) {
    await knex(table).where({ id }).del()
  }

  async deleteAll(table: string, where: object) {
    await knex(table).where(where).del()
  }

  async countWhere(table: string, where: object) {
    const count = await knex(table)
      .where(where)
      .count<Record<string, number>>('id')
      .first()
    if (!count) return 0
    return Object.values(count)[0]
  }
}
