'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClinicSchema extends Schema {
  up () {
    this.create('clinics', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('name')
      table.text('about')
      table.string('target')
      table.string('location')
      table.binary('image1')
      table.binary('image2')
      table.text('tls')
      table.string('grpc')
      table.text('macaroon')
      table.timestamps()
    })
  }

  down () {
    this.drop('clinics')
  }
}

module.exports = ClinicSchema
