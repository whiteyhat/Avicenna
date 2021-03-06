'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.integer('nonce').unsigned().notNullable().defaultTo(Math.floor(Math.random() * 10000))
      table.integer('clinic_id').unsigned().references('id').inTable('clinics')
      table.string('wallet').unique()
      table.boolean('admin').notNullable().defaultTo(0)
      table.string('name')
      table.boolean('staff').defaultTo(0)
      table.boolean('blockstack').defaultTo(0)
      table.string('role')
      table.string('address')
      table.string('phone')
      table.string('email')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
