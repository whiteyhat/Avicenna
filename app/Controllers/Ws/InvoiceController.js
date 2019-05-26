'use strict'

class InvoiceController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }
}

module.exports = InvoiceController
