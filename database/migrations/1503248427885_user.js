'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.integer('nonce').unsigned().notNullable().defaultTo(Math.floor(Math.random() * 10000))
      table.string('wallet').notNullable().unique()
      table.boolean('admin').notNullable().defaultTo(0)
      table.string('name')
      table.string('role')
      table.string('address')
      table.string('phone')
      table.string('email')
      table.string('clinic')
      table.binary('image')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema