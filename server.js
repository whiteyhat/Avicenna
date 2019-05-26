'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
   .appRoot(__dirname)
   .wsServer() // boot the WebSocket server
   .fireHttpServer()
   .catch(console.error)