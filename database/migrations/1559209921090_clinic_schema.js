'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClinicSchema extends Schema {
  up () {
    this.create('clinics', (table) => {
      table.increments()
      table.string('name')
      table.text('about')
      table.text('target')
      table.string('location')
      table.string('image1')
      table.string('image2')
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
